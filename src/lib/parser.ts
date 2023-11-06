import {TwingTokenStream} from "./token-stream";
import {TwingTagHandler, TwingTokenParser} from "./tag-handler";
import {TwingNodeVisitor} from "./node-visitor";
import {TwingParsingError, isAParsingError} from "./error/parsing";
import {BaseNode, createBaseNode, getChildren} from "./node";
import {createTextNode, textNodeType} from "./node/text";
import {createPrintNode} from "./node/print";
import {BaseExpressionNode} from "./node/expression";
import {BodyNode, createBodyNode} from "./node/body";
import {createModuleNode, ModuleNode} from "./node/module";
import {createNodeTraverser} from "./node-traverser";
import {MacroNode} from "./node/macro";
import {createCommentNode} from "./node/comment";
import {isMadeOfWhitespaceOnly} from "./helpers/is-made-of-whitespace-only";
import {ConstantNode, createConstantNode} from "./node/expression/constant";
import {createConcatNode} from "./node/expression/binary/concat";
import {AssignNameNode, createAssignNameNode} from "./node/expression/assign-name";
import {ArrowFunctionNode, createArrowFunctionNode} from "./node/expression/arrow-function";
import {BaseNameNode, createNameNode, NameNode} from "./node/expression/name";
import {createParentNode} from "./node/expression/parent";
import {createBlockReferenceExpressionNode} from "./node/expression/block-reference";
import {
    createGetAttributeNode,
    GetAttributeCallType
} from "./node/expression/get-attribute";
import {ArrayNode, createArrayNode, getKeyValuePairs} from "./node/expression/array";
import {createMethodCallNode, MethodCallNode} from "./node/expression/method-call";
import {createHashNode, HashNode} from "./node/expression/hash";
import {createTest, TwingTest} from "./test";
import {createNotNode} from "./node/expression/unary/not";
import {createConditionalNode} from "./node/expression/conditional";
import {TwingOperator} from "./operator";
import {namePattern, Token, TokenType} from "twig-lexer";
import {typeToEnglish} from "./lexer";
import {createFunctionNode} from "./node/expression/call/function";
import {createFilterNode} from "./node/expression/call/filter";
import type {TraitNode} from "./node/trait";
import {pushToRecord} from "./helpers/record";
import {ArgumentsNode, createArgumentsNode} from "./node/expression/arguments";
import {blockReferenceType} from "./node/block-reference";
import {spacelessNodeType} from "./node/spaceless";
import {TwingFilter} from "./filter";
import {TwingFunction} from "./function";
import {TwingCallableWrapper} from "./callable-wrapper";
import {BlockNode} from "./node/block";
import {getFunction} from "./helpers/get-function";
import {getFilter} from "./helpers/get-filter";
import {getTest as getTestByName} from "./helpers/get-test";

const nameRegExp = new RegExp(namePattern);

type TwingParserImportedSymbolAlias = {
    name: string,
    node: BaseNameNode<any>
};
type TwingParserImportedSymbolType = Map<string, TwingParserImportedSymbolAlias>;
type TwingParserImportedSymbol = {
    method: TwingParserImportedSymbolType;
    template: Array<string>;
};

export type TwingParserOptions = {
    strict: boolean;
};

type ParseTest = [tag: string | any, test: (token: Token) => boolean]; // todo: remove any

export interface TwingParser {
    parent: BaseNode | null;

    addImportedSymbol(type: 'template', alias: string): void;

    addImportedSymbol(type: 'method', alias: string, name: string, node: BaseNameNode<any>): void;

    addTrait(trait: TraitNode): void;

    embedTemplate(template: ModuleNode): void;

    getBlock(name: string): BodyNode | null;

    getVarName(prefix?: string): string;

    hasBlock(name: string): boolean;

    isMainScope(): boolean;

    parse(stream: TwingTokenStream, tag?: string | null, test?: ParseTest[1] | null, dropNeedle?: true): ModuleNode;

    parseArguments(stream: TwingTokenStream, namedArguments?: boolean, definition?: boolean, allowArrow?: true): ArrayNode;

    parseAssignmentExpression(stream: TwingTokenStream): ArgumentsNode<AssignNameNode>;

    parseExpression(stream: TwingTokenStream, precedence?: number, allowArrow?: true): BaseExpressionNode;

    parseFilterExpressionRaw(stream: TwingTokenStream, node: BaseExpressionNode, tag?: string | null): BaseExpressionNode;

    parseMultiTargetExpression(stream: TwingTokenStream): BaseExpressionNode;

    peekBlockStack(): string;

    popBlockStack(): void;

    popLocalScope(): void;

    pushBlockStack(name: string): void;

    pushLocalScope(): void;

    setBlock(name: string, value: BlockNode): void;

    setMacro(name: string, node: MacroNode): void;

    subparse(stream: TwingTokenStream, tag: string | null, test: ParseTest[1] | null, dropNeedle?: true): BaseNode;
}

export type StackEntry = {
    stream: TwingTokenStream;
    parent: BaseExpressionNode | null;
    blocks: Record<string, BodyNode>;
    blockStack: Array<string>;
    macros: Record<string, MacroNode>;
    importedSymbols: Array<TwingParserImportedSymbol>;
    traits: Record<string, TraitNode>;
    embeddedTemplates: Array<ModuleNode>;
};

const getNames = (
    map: Map<string, TwingCallableWrapper<any, any>>
): Array<string> => {
    return [...map.values()].map(({name}) => name);
};

export const createParser = (
    unaryOperators: Map<string, TwingOperator>,
    binaryOperators: Map<string, TwingOperator>,
    tagHandlers: Array<TwingTagHandler>,
    visitors: Array<TwingNodeVisitor>,
    filters: Map<string, TwingFilter>,
    functions: Map<string, TwingFunction>,
    tests: Map<string, TwingTest>,
    options: TwingParserOptions
): TwingParser => {
    const tokenParsers: Map<string, TwingTokenParser> = new Map();

    let varNameSalt = 0;

    let parent: BaseExpressionNode | null = null;
    let blocks: Record<string, BodyNode> = {};
    let blockStack: Array<string> = [];
    let macros: Record<string, MacroNode> = {};
    let importedSymbols: Array<TwingParserImportedSymbol> = [{
        method: new Map(),
        template: []
    }];
    let traits: Record<string, TraitNode> = {};
    let embeddedTemplates: Array<ModuleNode> = [];
    let embeddedTemplateIndex: number = 1;

    const filterNames = getNames(filters);
    const functionNames = getNames(functions);
    const testNames = getNames(tests);
    const tags = tagHandlers.map(({tag}) => tag);

    const stack: Array<StackEntry> = [];

    const addImportedSymbol: TwingParser["addImportedSymbol"] = (type, alias, name?: string, node?: BaseNameNode<any>) => {
        const localScope = importedSymbols[0];

        if (type === "method") {
            localScope[type].set(alias, {
                name: name!,
                node: node!
            });
        } else {
            localScope[type].push(alias);
        }
    };

    const addTrait: TwingParser["addTrait"] = (trait) => {
        pushToRecord(traits, trait);
    };

    // checks that the node only contains "constant" elements
    const checkConstantExpression = (stackEntry: TwingTokenStream, node: BaseNode): boolean => {
        if (!(node.type === "constant" || node.type === "array" || node.type === "hash" || node.type === "neg" || node.type === "pos")) {
            return false;
        }

        for (const [, child] of getChildren(node)) {
            if (!checkConstantExpression(stackEntry, child)) {
                return false;
            }
        }

        return true;
    };

    const embedTemplate: TwingParser["embedTemplate"] = (template) => {
        template.attributes.index = embeddedTemplateIndex++;

        embeddedTemplates.push(template);
    };

    const filterBodyNodes = (stream: TwingTokenStream, node: BaseNode, nested: boolean = false): BaseNode | null => {
        // check that the body does not contain non-empty output nodes
        if ((node.is(textNodeType) && !isMadeOfWhitespaceOnly(node.attributes.data)) ||
            (!node.is(textNodeType) && !node.is(blockReferenceType) && (node.isAnOutputNode && !node.is(spacelessNodeType)))) {
            if (node.toString().indexOf(String.fromCharCode(0xEF, 0xBB, 0xBF)) > -1) {
                let nodeData = (node.attributes as any).data as string; // todo

                let trailingData = nodeData.substring(3);

                if (trailingData === '' || isMadeOfWhitespaceOnly(trailingData)) {
                    // bypass empty nodes starting with a BOM
                    return null;
                }
            }

            throw new TwingParsingError(
                `A template that extends another one cannot include content outside Twig blocks. Did you forget to put the content inside a {% block %} tag?`,
                node.line,
                stream.getSourceContext()
            );
        }

        // bypass nodes that "capture" the output
        if (node.isACaptureNode) {
            // a "block" tag in such a node will serve as a block definition AND be displayed in place as well
            return node;
        }

        // to be removed completely in Twig 3.0
        if (!nested && (node.type === "spaceless")) {
            console.warn(`Using the spaceless tag at the root level of a child template in "${stream.getSourceContext().name}" at line ${node.line} is deprecated since Twig 2.5.0 and will become a syntax error in Twig 3.0.`);
        }

        // "block" tags that are not captured (see above) are only used for defining
        // the content of the block. In such a case, nesting it does not work as
        // expected as the definition is not part of the default template code flow.
        if (nested && (node.type === "block_reference")) {
            console.warn(`Nesting a block definition under a non-capturing node in "${stream.getSourceContext().name}" at line ${node.line} is deprecated since Twig 2.5.0 and will become a syntax error in Twig 3.0.`);

            return null;
        }

        if (node.isAnOutputNode && (node.type !== "spaceless")) {
            return null;
        }

        // here, nested means "being at the root level of a child template"
        // we need to discard the wrapping node for the "body" node
        nested = nested || (node.type !== null);

        for (let [k, child] of getChildren(node)) {
            if (child !== null && (filterBodyNodes(stream, child, nested) === null)) {
                delete node.children[k];
            }
        }

        return node;
    };

    const getBlock: TwingParser["getBlock"] = (name) => {
        return blocks[name] || null;
    };

    const getBlockStack = (): StackEntry["blockStack"] => {
        return blockStack;
    };

    const getFilterExpressionFactory = (stream: TwingTokenStream, name: string, line: number) => {
        const strict = options.strict || false;
        const filter = getFilter(filters, name);

        if (filter) {
            if (filter.isDeprecated) {
                let message = `Filter "${filter.name}" is deprecated`;

                if (filter.deprecatedVersion !== true) {
                    message += ` since version ${filter.deprecatedVersion}`;
                }

                if (filter.alternative) {
                    message += `. Use "${filter.alternative}" instead`;
                }

                let src = stream.getSourceContext();

                message += ` in "${src.name}" at line ${line}.`;

                console.warn(message);
            }

            return filter.expressionFactory;
        } else {
            if (strict) {
                const error = new TwingParsingError(`Unknown filter "${name}".`, line, stream.getSourceContext());

                error.addSuggestions(name, filterNames);

                throw error;
            }

            return createFilterNode;
        }
    };

    const getFunctionExpressionFactory = (stream: TwingTokenStream, name: string, line: number, _column: number) => {
        const strict = options.strict || false;
        const twingFunction = getFunction(functions, name);

        if (twingFunction) {
            if (twingFunction.isDeprecated) {
                let message = `Function "${twingFunction.name}" is deprecated`;

                if (twingFunction.deprecatedVersion !== true) {
                    message += ` since version ${twingFunction.deprecatedVersion}`;
                }

                if (twingFunction.alternative) {
                    message += `. Use "${twingFunction.alternative}" instead`;
                }

                const source = stream.getSourceContext();

                message += ` in "${source.name}" at line ${line}.`;

                console.warn(message);
            }

            return twingFunction.expressionFactory;
        } else {
            if (strict) {
                const error = new TwingParsingError(`Unknown function "${name}".`, line, stream.getSourceContext());

                error.addSuggestions(name, functionNames);

                throw error;
            }

            return createFunctionNode;
        }
    };

    const getFunctionNode = (stream: TwingTokenStream, name: string, line: number, column: number): BaseExpressionNode => {
        switch (name) {
            case 'parent':
                parseArguments(stream);

                if (!getBlockStack().length) {
                    throw new TwingParsingError('Calling "parent" outside a block is forbidden.', line, stream.getSourceContext());
                }

                if (!parent && !hasTraits()) {
                    throw new TwingParsingError('Calling "parent" on a template that does not extend nor "use" another template is forbidden.', line, stream.getSourceContext());
                }

                return createParentNode(peekBlockStack(), line, column);
            case 'block':
                const blockArgs = parseArguments(stream);
                const keyValuePairs = getKeyValuePairs(blockArgs);

                if (keyValuePairs.length < 1) {
                    throw new TwingParsingError('The "block" function takes one argument (the block name).', line, stream.getSourceContext());
                }

                return createBlockReferenceExpressionNode(keyValuePairs[0].value, keyValuePairs.length > 1 ? keyValuePairs[1].value : null, line, column);
            case 'attribute':
                const attributeArgs = parseArguments(stream);
                const attributeKeyValuePairs = getKeyValuePairs(attributeArgs);

                if (attributeKeyValuePairs.length < 2) {
                    throw new TwingParsingError('The "attribute" function takes at least two arguments (the variable and the attributes).', line, stream.getSourceContext());
                }

                return createGetAttributeNode(
                    attributeKeyValuePairs[0].value,
                    attributeKeyValuePairs[1].value,
                    attributeKeyValuePairs.length > 2 ? attributeKeyValuePairs[2].value : createArrayNode([], line, column),
                    "any",
                    line, column
                );
            default:
                const alias = getImportedMethod(name);

                if (alias) {
                    const argumentsNode = parseArguments(stream);

                    const node = createMethodCallNode(alias.node, alias.name, argumentsNode, line, column);

                    node.attributes.safe = true;

                    return node;
                }

                const aliasArguments = parseArguments(stream, true);
                const aliasFactory = getFunctionExpressionFactory(stream, name, line, column);

                return aliasFactory(name, aliasArguments, line, column);
        }
    };

    const getImportedMethod = (alias: string): TwingParserImportedSymbolAlias | null => {
        let result: TwingParserImportedSymbolAlias | null;

        const testImportedSymbol = (importedSymbol: TwingParserImportedSymbol) => {
            const importedSymbolType = importedSymbol["method"];

            if (importedSymbolType && importedSymbolType.has(alias)) {
                return importedSymbolType.get(alias);
            }

            return null;
        };

        result = testImportedSymbol(importedSymbols[0]) || null;

        // if the symbol does not exist in the current scope (0), try in the main/global scope (last index)
        let length = importedSymbols.length;

        if (!result && (length > 1)) {
            result = testImportedSymbol(importedSymbols[length - 1]) || null;
        }

        return result;
    };

    const getImportedTemplate = (alias: string): string | null => {
        let result: string | null;

        const testImportedSymbol = (importedSymbol: TwingParserImportedSymbol) => {
            const importedSymbolType = importedSymbol["template"];

            if (importedSymbolType && importedSymbolType.includes(alias)) {
                return alias;
            }

            return null;
        };

        result = testImportedSymbol(importedSymbols[0]) || null;

        // if the symbol does not exist in the current scope (0), try in the main/global scope (last index)
        let length = importedSymbols.length;

        if (!result && (length > 1)) {
            result = testImportedSymbol(importedSymbols[length - 1]) || null;
        }

        return result;
    };

    const getPrimary = (stream: TwingTokenStream): BaseExpressionNode => {
        let token = stream.getCurrent();
        let operator: TwingOperator | null;

        if ((operator = isUnary(token)) !== null) {
            stream.next();

            const expression = parseExpression(stream, operator.precedence);
            const expressionFactory = operator.expressionFactory;

            return parsePostfixExpression(stream, expressionFactory([expression, createBaseNode(null)], token.line, token.column));
        } else if (token.test(TokenType.PUNCTUATION, '(')) {
            stream.next();

            const expression = parseExpression(stream);

            stream.expect(TokenType.PUNCTUATION, ')', 'An opened parenthesis is not properly closed');

            return parsePostfixExpression(stream, expression);
        }

        return parsePrimaryExpression(stream);
    };

    const getTest = (stream: TwingTokenStream, line: number): [string, TwingTest] => {
        const strict = options.strict || false;

        let name = stream.expect(TokenType.NAME).value;
        let test = getTestByName(tests, name);

        if (!test) {
            if (stream.test(TokenType.NAME)) {
                // try 2-words tests
                name = name + ' ' + stream.getCurrent().value;

                test = getTestByName(tests, name);

                if (test) {
                    stream.next();
                } else {
                    // non-existing two-words test
                    if (!strict) {
                        stream.next();

                        test = createTest(name, null, []);
                    }
                }
            } else {
                // non-existing one-word test
                if (!strict) {
                    test = createTest(name, null, []);
                }
            }
        }

        if (test) {
            if (test.isDeprecated) {
                let message = `Test "${test.name}" is deprecated`;

                if (test.deprecatedVersion !== true) {
                    message += ` since version ${test.deprecatedVersion}`;
                }

                if (test.alternative) {
                    message += `. Use "${test.alternative}" instead`;
                }

                const source = stream.getSourceContext();

                message += ` in "${source.name}" at line ${line}.`;

                console.warn(message);
            }

            return [name, test];
        }

        const error = new TwingParsingError(`Unknown test "${name}".`, line, stream.getSourceContext());

        error.addSuggestions(name, testNames);

        throw error;
    };

    const getVarName: TwingParser["getVarName"] = (prefix = '__internal_') => {
        return `${prefix}${varNameSalt++}`;
    };

    const hasBlock: TwingParser["hasBlock"] = (name) => {
        return blocks[name] !== undefined;
    };

    const hasTraits = () => {
        return Object.keys(traits).length > 0
    };
    
    const isBinary = (token: Token): TwingOperator | null => {
        return (token.test(TokenType.OPERATOR) && binaryOperators.get(token.value)) || null;
    };

    const isUnary = (token: Token): TwingOperator | null => {
        return (token.test(TokenType.OPERATOR) && unaryOperators.get(token.value)) || null;
    };

    const parse: TwingParser["parse"] = (stream, tag = null, test = null, dropNeedle = undefined) => {
        stack.push({
            stream,
            parent,
            blocks,
            blockStack,
            macros,
            importedSymbols,
            traits,
            embeddedTemplates
        });

        parent = null;
        blocks = {};
        macros = {};
        traits = {};
        blockStack = [];
        importedSymbols = [{
            method: new Map(),
            template: []
        }];
        embeddedTemplates = [];

        let body: BaseNode | null;

        try {
            body = subparse(stream, tag, test, dropNeedle);

            if (parent !== null && (body = filterBodyNodes(stream, body)) === null) {
                body = createBaseNode(null);
            }
        } catch (error: any) {
            if (isAParsingError(error)) {
                if (!error.source) {
                    error.source = stream.getSourceContext();
                }
            }

            throw error;
        }

        let node = createModuleNode(
            createBodyNode(body, 1, 1),
            parent,
            createBaseNode(null, {}, blocks),
            createBaseNode(null, {}, macros),
            createBaseNode(null, {}, traits),
            embeddedTemplates,
            stream.getSourceContext(),
            1, 1
        );

        const traverse = createNodeTraverser(visitors);

        node = traverse(node) as ModuleNode;

        // restore previous stack so previous parse() call can resume working
        const previousStackEntry = stack.pop()!;

        parent = previousStackEntry.parent;
        blocks = previousStackEntry.blocks;
        macros = previousStackEntry.macros;
        traits = previousStackEntry.traits;
        blockStack = previousStackEntry.blockStack;
        importedSymbols = previousStackEntry.importedSymbols;
        embeddedTemplates = previousStackEntry.embeddedTemplates;

        return node;
    }

    /**
     * Parses arguments.
     *
     * @param namedArguments {boolean} Whether to allow named arguments or not
     * @param definition {boolean} Whether we are parsing arguments for a macro definition
     * @param allowArrow {boolean}
     *
     * @throws TwingErrorSyntax
     */
    const parseArguments: TwingParser["parseArguments"] = (
        stream,
        namedArguments = false,
        definition = false,
        allowArrow?: true
    ) => {
        const {line, column} = stream.getCurrent();
        const elements: Array<{
            key?: ConstantNode;
            value: BaseExpressionNode;
        }> = [];

        let value: BaseExpressionNode;
        let token: Token;

        stream.expect(TokenType.PUNCTUATION, '(', 'A list of arguments must begin with an opening parenthesis');

        while (!stream.test(TokenType.PUNCTUATION, ')')) {
            if (elements.length > 0) {
                stream.expect(TokenType.PUNCTUATION, ',', 'Arguments must be separated by a comma');
            }

            if (definition) {
                token = stream.expect(TokenType.NAME, null, 'An argument must be a name');

                const {line, column} = stream.getCurrent();

                value = createNameNode(token.value, line, column);
            } else {
                value = parseExpression(stream, 0, allowArrow);
            }

            let key: ConstantNode | undefined = undefined;

            if (namedArguments && (token = stream.nextIf(TokenType.OPERATOR, '='))) {
                if (!value.is("name")) {
                    throw new TwingParsingError(`A parameter name must be a string, "${value.type.toString()}" given.`, token.line, stream.getSourceContext());
                }

                key = createConstantNode(value.attributes.name, value.line, value.column);

                if (definition) {
                    value = parsePrimaryExpression(stream);

                    if (!checkConstantExpression(stream, value)) {
                        throw new TwingParsingError(`A default value for an argument must be a constant (a boolean, a string, a number, or an array).`, token.line, stream.getSourceContext());
                    }
                } else {
                    value = parseExpression(stream, 0, allowArrow);
                }
            }

            if (definition) {
                if (key === undefined) {
                    key = createConstantNode((value as NameNode).attributes.name, line, column);
                    value = createConstantNode(null, line, column);
                }
            }

            elements.push({
                key,
                value
            });
        }

        stream.expect(TokenType.PUNCTUATION, ')', 'A list of arguments must be closed by a parenthesis');

        const arrayNode = createArrayNode(elements, line, column);

        return arrayNode;
    };

    const parseArrayExpression = (stream: TwingTokenStream): ArrayNode => {
        stream.expect(TokenType.PUNCTUATION, '[', 'An array element was expected');

        const elements: Array<BaseExpressionNode> = [];

        let first = true;

        while (!stream.test(TokenType.PUNCTUATION, ']')) {
            if (!first) {
                stream.expect(TokenType.PUNCTUATION, ',', 'An array element must be followed by a comma');

                // trailing ,?
                if (stream.test(TokenType.PUNCTUATION, ']')) {
                    break;
                }
            }

            first = false;

            elements.push(parseExpression(stream));
        }

        stream.expect(TokenType.PUNCTUATION, ']', 'An opened array is not properly closed');

        return createArrayNode(elements.map((element) => {
            return {
                value: element
            };
        }), stream.getCurrent().line, stream.getCurrent().column);
    };

    const parseAssignmentExpression: TwingParser["parseAssignmentExpression"] = (stream) => {
        const targets: Record<string, AssignNameNode> = {};
        const {line, column} = stream.getCurrent();

        while (true) {
            let token = stream.getCurrent();

            if (stream.test(TokenType.OPERATOR) && nameRegExp.exec(token.value)) {
                // in this context, string operators are variable names
                stream.next();
            } else {
                stream.expect(TokenType.NAME, null, 'Only variables can be assigned to');
            }

            let value = token.value;

            if (['true', 'false', 'none', 'null'].indexOf(value.toLowerCase()) > -1) {
                throw new TwingParsingError(`You cannot assign a value to "${value}".`, token.line, stream.getSourceContext());
            }

            pushToRecord(targets, createAssignNameNode(value, token.line, token.column));

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        return createArgumentsNode(targets, line, column);
    };

    const parseArrow = (stream: TwingTokenStream): ArrowFunctionNode | null => {
        let token: Token;
        let line: number;
        let column: number;
        let names: Record<number, AssignNameNode>;

        // short array syntax (one argument, no parentheses)?
        if (stream.look(1).test(TokenType.ARROW)) {
            line = stream.getCurrent().line;
            column = stream.getCurrent().column;
            token = stream.expect(TokenType.NAME);
            names = {
                0: createAssignNameNode(token.value, token.line, token.column)
            };

            stream.expect(TokenType.ARROW);

            return createArrowFunctionNode(parseExpression(stream, 0) as any, createBaseNode(null, {}, names), line, column);
        }

        // first, determine if we are parsing an arrow function by finding => (long form)
        let i: number = 0;

        if (!stream.look(i).test(TokenType.PUNCTUATION, '(')) {
            return null;
        }

        ++i;

        while (true) {
            // variable name
            ++i;

            if (!stream.look(i).test(TokenType.PUNCTUATION, ',')) {
                break;
            }

            ++i;
        }

        if (!stream.look(i).test(TokenType.PUNCTUATION, ')')) {
            return null;
        }

        ++i;

        if (!stream.look(i).test(TokenType.ARROW)) {
            return null;
        }

        // yes, let's parse it properly
        token = stream.expect(TokenType.PUNCTUATION, '(');
        line = token.line;
        column = token.column;
        names = {};

        i = 0;

        while (true) {
            token = stream.getCurrent();

            if (!token.test(TokenType.NAME)) {
                throw new TwingParsingError(`Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}".`, token.line, stream.getSourceContext());
            }

            names[i++] = createAssignNameNode(token.value, token.line, token.column);

            stream.next();

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        stream.expect(TokenType.PUNCTUATION, ')');
        stream.expect(TokenType.ARROW);

        return createArrowFunctionNode(parseExpression(stream, 0), createBaseNode(null, {}, names), line, column);
    };

    const parseConditionalExpression: TwingParser["parseFilterExpressionRaw"] = (stream, expression): BaseExpressionNode => {
        let expr2: BaseExpressionNode;
        let expr3: BaseExpressionNode;

        while (stream.nextIf(TokenType.PUNCTUATION, '?')) {
            if (!stream.nextIf(TokenType.PUNCTUATION, ':')) {
                expr2 = parseExpression(stream);

                if (stream.nextIf(TokenType.PUNCTUATION, ':')) {
                    expr3 = parseExpression(stream);
                } else {
                    const {line, column} = stream.getCurrent();

                    expr3 = createConstantNode('', line, column);
                }
            } else {
                expr2 = expression;
                expr3 = parseExpression(stream);
            }

            const {line, column} = stream.getCurrent();

            expression = createConditionalNode(expression, expr2, expr3, line, column);
        }

        return expression;
    };

    const parseExpression: TwingParser["parseExpression"] = (stream, precedence = 0, allowArrow = undefined) => {
        if (allowArrow) {
            const arrow = parseArrow(stream);

            if (arrow) {
                return arrow;
            }
        }

        let expression = getPrimary(stream);
        let token = stream.getCurrent();
        let operator: TwingOperator | null = null;
        
        if ((token.value === "is not") || (token.value === "is")) {
            stream.next();
            
            if (token.value === "is not") {
                expression = parseNotTestExpression(stream, expression);
            }
            else {
                expression = parseTestExpression(stream, expression);
            }
        }
        else {
            while (((operator = isBinary(token)) !== null) && operator.precedence >= precedence) {
                stream.next();
                
                const {expressionFactory} = operator;

                const operand = parseExpression(stream, operator.associativity === "LEFT" ? operator.precedence + 1 : operator.precedence);

                expression = expressionFactory([expression, operand], token.line, token.column);

                token = stream.getCurrent();
            }
        }

        if (precedence === 0) {
            return parseConditionalExpression(stream, expression);
        }

        return expression;
    };

    const parseFilterExpression = (stream: TwingTokenStream, node: BaseExpressionNode): BaseExpressionNode => {
        stream.next();

        return parseFilterExpressionRaw(stream, node);
    };

    const parseFilterExpressionRaw = (stream: TwingTokenStream, node: BaseExpressionNode, tag: string | null = null): BaseExpressionNode => {
        while (true) {
            const token = stream.expect(TokenType.NAME);
            const {value, line, column} = token;

            let methodArguments;

            if (!stream.test(TokenType.PUNCTUATION, '(')) {
                methodArguments = createArrayNode([], line, column);
            } else {
                methodArguments = parseArguments(stream, true, false, true);
            }

            const factory = getFilterExpressionFactory(stream, value, line);

            node = factory(node, value, methodArguments, token.line, token.column, tag);

            if (!stream.test(TokenType.PUNCTUATION, '|')) {
                break;
            }

            stream.next();
        }

        return node;
    };

    const parseHashExpression = (stream: TwingTokenStream): HashNode => {
        stream.expect(TokenType.PUNCTUATION, '{', 'A hash element was expected');

        let first = true;

        const elements: Array<{
            key: BaseExpressionNode;
            value: BaseExpressionNode;
        }> = [];

        while (!stream.test(TokenType.PUNCTUATION, '}')) {
            if (!first) {
                stream.expect(TokenType.PUNCTUATION, ',', 'A hash value must be followed by a comma');

                // trailing ,?
                if (stream.test(TokenType.PUNCTUATION, '}')) {
                    break;
                }
            }

            first = false;

            // a hash key can be:
            //
            //  * a number -- 12
            //  * a string -- 'a'
            //  * a name, which is equivalent to a string -- a
            //  * an expression, which must be enclosed in parentheses -- (1 + 2)
            let token;
            let key: BaseExpressionNode;

            if ((token = stream.nextIf(TokenType.STRING)) || (token = stream.nextIf(TokenType.NAME)) || (token = stream.nextIf(TokenType.NUMBER))) {
                key = createConstantNode(token.value, token.line, token.column);
            } else if (stream.test(TokenType.PUNCTUATION, '(')) {
                key = parseExpression(stream);
            } else {
                const {type, line, value} = stream.getCurrent();

                throw new TwingParsingError(`A hash key must be a quoted string, a number, a name, or an expression enclosed in parentheses (unexpected token "${typeToEnglish(type)}" of value "${value}".`, line, stream.getSourceContext());
            }

            stream.expect(TokenType.PUNCTUATION, ':', 'A hash key must be followed by a colon (:)');

            const value = parseExpression(stream);

            elements.push({
                key,
                value
            });
        }

        stream.expect(TokenType.PUNCTUATION, '}', 'An opened hash is not properly closed');

        return createHashNode(elements, stream.getCurrent().line, stream.getCurrent().column);
    };

    const parseMultiTargetExpression: TwingParser["parseMultiTargetExpression"] = (stream) => {
        const {line, column} = stream.getCurrent();

        const targets: Record<number, BaseExpressionNode> = {};

        while (true) {
            pushToRecord(targets, parseExpression(stream));

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        return createArgumentsNode(targets, line, column);
    };

    const parseNotTestExpression = (stream: TwingTokenStream, node: BaseExpressionNode): BaseExpressionNode => {
        const {line, column} = stream.getCurrent();

        return createNotNode(parseTestExpression(stream, node), line, column);
    };

    const parsePostfixExpression = (stream: TwingTokenStream, node: BaseExpressionNode): BaseExpressionNode => {
        while (true) {
            let token = stream.getCurrent();

            if (token.type === TokenType.PUNCTUATION) {
                if ('.' == token.value || '[' == token.value) {
                    node = parseSubscriptExpression(stream, node);
                } else if ('|' == token.value) {
                    node = parseFilterExpression(stream, node);
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        return node;
    };

    const parsePrimaryExpression = (stream: TwingTokenStream): BaseExpressionNode => {
        const token = stream.getCurrent();

        let node: BaseExpressionNode;

        switch (token.type) {
            case TokenType.NAME:
                stream.next();

                switch (token.value) {
                    case 'true':
                    case 'TRUE':
                        node = createConstantNode(true, token.line, token.column);
                        break;

                    case 'false':
                    case 'FALSE':
                        node = createConstantNode(false, token.line, token.column);
                        break;

                    case 'none':
                    case 'NONE':
                    case 'null':
                    case 'NULL':
                        node = createConstantNode(null, token.line, token.column);
                        break;

                    default:
                        if ('(' === stream.getCurrent().value) {
                            node = getFunctionNode(stream, token.value, token.line, token.column);
                        } else {
                            node = createNameNode(token.value, token.line, token.column);
                        }
                }
                break;

            case TokenType.NUMBER:
                stream.next();
                node = createConstantNode(token.value, token.line, token.column);
                break;

            case TokenType.STRING:
            case TokenType.INTERPOLATION_START:
                node = parseStringExpression(stream);
                break;

            case TokenType.OPERATOR:
                let match = nameRegExp.exec(token.value);

                if (match !== null && match[0] === token.value) {
                    // in this context, string operators are variable names
                    stream.next();
                    node = createNameNode(token.value, token.line, token.column);

                    break;
                } else if (unaryOperators.has(token.value)) {
                    const operator = unaryOperators.get(token.value)!;

                    stream.next();

                    const expression = parsePrimaryExpression(stream);
                    const {expressionFactory} = operator;

                    node = expressionFactory([expression, createBaseNode(null)], token.line, token.column);

                    break;
                }

            default:
                if (token.test(TokenType.PUNCTUATION, '[')) {
                    node = parseArrayExpression(stream);
                } else if (token.test(TokenType.PUNCTUATION, '{')) {
                    node = parseHashExpression(stream);
                } else if (token.test(TokenType.OPERATOR, '=') && (stream.look(-1).value === '==' || stream.look(-1).value === '!=')) {
                    throw new TwingParsingError(`Unexpected operator of value "${token.value}". Did you try to use "===" or "!==" for strict comparison? Use "is same as(value)" instead.`, token.line, stream.getSourceContext());
                } else {
                    throw new TwingParsingError(`Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}".`, token.line, stream.getSourceContext());
                }
        }

        return parsePostfixExpression(stream, node);
    };

    const parseStringExpression = (stream: TwingTokenStream): BaseExpressionNode => {
        const nodes: Array<BaseExpressionNode> = [];

        // a string cannot be followed by another string in a single expression
        let nextCanBeString = true;
        let token;

        while (true) {
            if (nextCanBeString && (token = stream.nextIf(TokenType.STRING))) {
                nodes.push(createConstantNode(token.value, token.line, token.column));
                nextCanBeString = false;
            } else if (stream.nextIf(TokenType.INTERPOLATION_START)) {
                nodes.push(parseExpression(stream));
                stream.expect(TokenType.INTERPOLATION_END);
                nextCanBeString = true;
            } else {
                break;
            }
        }

        let expression = nodes.shift()!;

        for (const node of nodes) {
            expression = createConcatNode([expression, node], node.line, node.column);
        }

        return expression;
    };

    const parseSubscriptExpression = (stream: TwingTokenStream, node: BaseExpressionNode) => {
        let token = stream.next();
        let {line, column} = token;
        let arg: BaseExpressionNode;

        let type: GetAttributeCallType = "any";

        const elements: Array<BaseExpressionNode> = [];

        const createArrayNodeFromElements = () => {
            return createArrayNode(elements.map((element) => {
                return {
                    value: element
                };
            }), line, column);
        };

        if (token.value === '.') {
            token = stream.next();

            let match = nameRegExp.exec(token.value);

            if ((token.type === TokenType.NAME) || (token.type === TokenType.NUMBER) || (token.type === TokenType.OPERATOR && (match !== null))) {
                arg = createConstantNode(token.value, line, column);

                if (stream.test(TokenType.PUNCTUATION, '(')) {
                    type = "method";

                    const argumentsNode = parseArguments(stream);

                    for (const {value} of getKeyValuePairs(argumentsNode)) {
                        elements.push(value);
                    }
                }
            } else {
                throw new TwingParsingError('Expected name or number.', line, stream.getSourceContext());
            }

            if ((node.is("name")) && getImportedTemplate(node.attributes.name)) {
                const name = (arg as ConstantNode).attributes.value as string;
                const methodCallNode = createMethodCallNode(node, name, createArrayNodeFromElements(), line, column);

                methodCallNode.attributes.safe = true;

                return methodCallNode;
            }
        } else {
            type = "array";

            // slice?
            let slice = false;

            if (stream.test(TokenType.PUNCTUATION, ':')) {
                slice = true;
                arg = createConstantNode(0, token.line, token.column);
            } else {
                arg = parseExpression(stream);
            }

            if (stream.nextIf(TokenType.PUNCTUATION, ':')) {
                slice = true;
            }

            if (slice) {
                let length: ConstantNode;

                if (stream.test(TokenType.PUNCTUATION, ']')) {
                    length = createConstantNode(null, token.line, token.column);
                } else {
                    length = parseExpression(stream) as ConstantNode;
                }

                const factory = getFilterExpressionFactory(stream, 'slice', token.line);
                const filterArguments = createArrayNode([
                    {
                        key: createConstantNode(0, line, column),
                        value: arg
                    },
                    {
                        key: createConstantNode(1, line, column),
                        value: length
                    }
                ], 1, 1);
                const filter = factory(node, 'slice', filterArguments, token.line, token.column);

                stream.expect(TokenType.PUNCTUATION, ']');

                return filter;
            }

            stream.expect(TokenType.PUNCTUATION, ']');
        }

        return createGetAttributeNode(node, arg, createArrayNodeFromElements(), type, line, column);
    };

    const parseTestExpression = (stream: TwingTokenStream, node: BaseExpressionNode): BaseExpressionNode => {
        const {line, column} = stream.getCurrent();
        const [name, test] = getTest(stream, node.line);
        const expressionFactory = test.expressionFactory;

        let testArguments = createArrayNode([], line, column);

        if (stream.test(TokenType.PUNCTUATION, '(')) {
            testArguments = parseArguments(stream, true);
        }

        if ((name === 'defined') && (node.is("name"))) {
            const alias = getImportedMethod(node.attributes.name);

            if (alias !== null) {
                node = createMethodCallNode(alias.node, alias.name, createArrayNode([], node.line, node.column), node.line, node.column);
                (node as MethodCallNode).attributes.safe = true;
            }
        }

        return expressionFactory(node, name, testArguments, line, column);
    };

    const peekBlockStack: TwingParser["peekBlockStack"] = () => {
        return blockStack[blockStack.length - 1];
    };

    const popBlockStack: TwingParser["popBlockStack"] = () => {
        blockStack.pop();
    };

    const popLocalScope: TwingParser["popLocalScope"] = () => {
        importedSymbols.shift();
    };

    const pushBlockStack: TwingParser["pushBlockStack"] = (name) => {
        blockStack.push(name);
    };

    const pushLocalScope: TwingParser["pushLocalScope"] = () => {
        importedSymbols.unshift({
            method: new Map(),
            template: []
        });
    };

    const isMainScope = () => {
        return importedSymbols.length === 1;
    };

    const setBlock: TwingParser["setBlock"] = (name, value) => {
        let bodyNodes = new Map();

        bodyNodes.set(0, value);

        blocks[name] = createBodyNode(value, value.line, value.column);
    }

    const setMacro: TwingParser["setMacro"] = (name, node) => {
        macros[name] = node
    };

    const subparse: TwingParser["subparse"] = (stream, tag, test, dropNeedle) => {
        // token parsers
        if (tokenParsers.size === 0) {
            for (const handler of tagHandlers) {
                tokenParsers.set(handler.tag, handler.initialize(parser));
            }
        }

        let {line, column} = stream.getCurrent();
        let children: Record<number, BaseNode> = {};
        let i: number = 0;
        let token: Token;

        while (!stream.isEOF()) {
            switch (stream.getCurrent().type) {
                case TokenType.TEXT:
                    token = stream.next();
                    children[i++] = createTextNode(token.value, token.line, token.column);

                    break;
                case TokenType.VARIABLE_START:
                    token = stream.next();

                    const expression = parseExpression(stream);

                    stream.expect(TokenType.VARIABLE_END);
                    children[i++] = createPrintNode(expression, token.line, token.column);

                    break;
                case TokenType.TAG_START:
                    stream.next();

                    token = stream.getCurrent();

                    if (token.type !== TokenType.NAME) {
                        throw new TwingParsingError('A block must start with a tag name.', token.line, stream.getSourceContext());
                    }

                    // todo: what is the test case of the following scenario
                    if ((test !== null) && test(token)) {
                        if (dropNeedle) {
                            stream.next();
                        }

                        if (Object.keys(children).length === 1) {
                            return children[0];
                        }

                        return createBaseNode(null, {}, children, line, column);
                    }

                    if (!tokenParsers.has(token.value)) {
                        let error;

                        if (test !== null) {
                            error = new TwingParsingError(
                                `Unexpected "${token.value}" tag`,
                                token.line,
                                stream.getSourceContext()
                            );

                            error.appendMessage(` (expecting closing tag for the "${tag}" tag defined near line ${line}).`);
                        } else {
                            error = new TwingParsingError(
                                `Unknown "${token.value}" tag.`,
                                token.line,
                                stream.getSourceContext()
                            );

                            error.addSuggestions(token.value, tags);
                        }

                        throw error;
                    }

                    stream.next();

                    const parseToken = tokenParsers.get(token.value)!;
                    const node = parseToken(token, stream);

                    if (node !== null) {
                        children[i++] = node;
                    }

                    break;
                case TokenType.COMMENT_START:
                    stream.next();
                    token = stream.expect(TokenType.TEXT);
                    stream.expect(TokenType.COMMENT_END);
                    children[i++] = createCommentNode(token.value, token.line, token.column);

                    break;
                default:
                    throw new TwingParsingError(
                        'Lexer or parser ended up in unsupported state.',
                        stream.getCurrent().line,
                        stream.getSourceContext()
                    );
            }
        }

        if (Object.keys(children).length === 1) {
            return children[0];
        }

        return createBaseNode(null, {}, children, line, column);
    };

    const parser = {
        addImportedSymbol,
        addTrait,
        embedTemplate,
        getBlock,
        getVarName,
        hasBlock,
        isMainScope,
        parse,
        parseArguments,
        parseAssignmentExpression,
        parseExpression,
        parseFilterExpressionRaw,
        parseMultiTargetExpression,
        peekBlockStack,
        popBlockStack,
        popLocalScope,
        pushBlockStack,
        pushLocalScope,
        setBlock,
        setMacro,
        subparse,
        get parent() {
            return parent;
        },
        set parent(aParent) {
            parent = aParent;
        }
    };

    return parser;
};
