import type {TwingTokenStream} from "./token-stream";
import {TwingTagHandler, TwingTokenParser} from "./tag-handler";
import {TwingNodeVisitor} from "./node-visitor";
import {createParsingError, TwingParsingError} from "./error/parsing";
import {TwingBaseNode, createBaseNode, getChildren} from "./node";
import {createTextNode, textNodeType} from "./node/output/text";
import {createPrintNode} from "./node/output/print";
import {TwingBaseExpressionNode} from "./node/expression";
import {createBodyNode} from "./node/body";
import {createModuleNode, TwingModuleNode} from "./node/module";
import {createNodeTraverser} from "./node-traverser";
import {TwingMacroNode} from "./node/macro";
import {createCommentNode} from "./node/comment";
import {isMadeOfWhitespaceOnly} from "./helpers/is-made-of-whitespace-only";
import {TwingConstantNode, createConstantNode} from "./node/expression/constant";
import {createConcatenateNode} from "./node/expression/binary/concatenate";
import {TwingAssignmentNode, createAssignmentNode} from "./node/expression/assignment";
import {TwingArrowFunctionNode, createArrowFunctionNode} from "./node/expression/arrow-function";
import {createNameNode, TwingNameNode} from "./node/expression/name";
import {createParentFunctionNode} from "./node/expression/parent-function";
import {createBlockFunctionNode} from "./node/expression/block-function";
import {
    createAttributeAccessorNode,
    TwingGetAttributeCallType
} from "./node/expression/attribute-accessor";
import {TwingArrayNode, createArrayNode, getKeyValuePairs} from "./node/expression/array";
import {createMethodCallNode} from "./node/expression/method-call";
import {createHashNode, hashNodeType, TwingHashNode} from "./node/expression/hash";
import {TwingTest} from "./test";
import {createNotNode} from "./node/expression/unary/not";
import {createConditionalNode} from "./node/expression/conditional";
import {TwingOperator} from "./operator";
import {namePattern, Token, TokenType} from "twig-lexer";
import {typeToEnglish} from "./lexer";
import {createFunctionNode} from "./node/expression/call/function";
import {createFilterNode, TwingFilterNode} from "./node/expression/call/filter";
import type {TwingTraitNode} from "./node/trait";
import {pushToRecord} from "./helpers/record";
import {ArgumentsNode, createArgumentsNode} from "./node/expression/arguments";
import {blockReferenceType} from "./node/output/block-reference";
import {spacelessNodeType} from "./node/output/spaceless";
import {TwingFilter} from "./filter";
import {TwingFunction} from "./function";
import {TwingCallableWrapper} from "./callable-wrapper";
import {TwingBlockNode} from "./node/block";
import {getFunction} from "./helpers/get-function";
import {getFilter} from "./helpers/get-filter";
import {getTest as getTestByName} from "./helpers/get-test";
import {createCoreNodeVisitor} from "./node-visitor/core";
import {createEscaperNodeVisitor} from "./node-visitor/escaper";
import {createMacroAutoImportNodeVisitor} from "./node-visitor/macro-auto-import";
import {createSandboxNodeVisitor} from "./node-visitor/sandbox";
import {createTestNode} from "./node/expression/call/test";
import {positiveNodeType} from "./node/expression/unary/pos";
import {negativeNodeType} from "./node/expression/unary/neg";

const nameRegExp = new RegExp(namePattern);

type NodeWithName = TwingBaseNode<any, {
    name: string;
}>;

type TwingParserImportedSymbolAlias = {
    name: string,
    node: NodeWithName
};
type TwingParserImportedSymbolType = Map<string, TwingParserImportedSymbolAlias>;
type TwingParserImportedSymbol = {
    method: TwingParserImportedSymbolType;
    template: Array<string>;
};

export type TwingParserOptions = {
    strict: boolean;
};

type ParseTest = [tag: string, test: (token: Token) => boolean];

export interface TwingParser {
    parent: TwingBaseNode | null;

    addImportedSymbol(type: 'template', alias: string): void;

    addImportedSymbol(type: 'method', alias: string, name: string, node: NodeWithName): void;

    addTrait(trait: TwingTraitNode): void;

    embedTemplate(template: TwingModuleNode): void;

    getBlock(name: string): TwingBlockNode | null;

    getVarName(prefix?: string): string;

    isMainScope(): boolean;

    parse(stream: TwingTokenStream, tag?: string | null, test?: ParseTest[1] | null, dropNeedle?: true): TwingModuleNode;

    parseArguments(stream: TwingTokenStream, namedArguments?: boolean, definition?: boolean, allowArrow?: true): TwingArrayNode;

    parseAssignmentExpression(stream: TwingTokenStream): ArgumentsNode<TwingAssignmentNode>;

    parseExpression(stream: TwingTokenStream, precedence?: number, allowArrow?: true): TwingBaseExpressionNode;

    parseFilterDefinitions(stream: TwingTokenStream): Array<{
        name: string;
        arguments: TwingArrayNode;
    }>;

    parseFilterExpressionRaw(stream: TwingTokenStream, node: TwingBaseExpressionNode, tag?: string | null): TwingFilterNode;

    parseMultiTargetExpression(stream: TwingTokenStream): TwingBaseExpressionNode;

    peekBlockStack(): string;

    popBlockStack(): void;

    popLocalScope(): void;

    pushBlockStack(name: string): void;

    pushLocalScope(): void;

    setBlock(name: string, node: TwingBlockNode): void;

    setMacro(name: string, node: TwingMacroNode): void;

    subparse(stream: TwingTokenStream, tag: string | null, test: ParseTest[1] | null, dropNeedle?: true): TwingBaseNode;
}

export type StackEntry = {
    stream: TwingTokenStream;
    parent: TwingBaseExpressionNode | null;
    blocks: Record<string, TwingBlockNode>;
    blockStack: Array<string>;
    macros: Record<string, TwingMacroNode>;
    importedSymbols: Array<TwingParserImportedSymbol>;
    traits: Record<string, TwingTraitNode>;
    embeddedTemplates: Array<TwingModuleNode>;
};

const getNames = (
    map: Map<string, TwingCallableWrapper<any>>
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

    let parent: TwingBaseExpressionNode | null = null;
    let blocks: Record<string, TwingBlockNode> = {};
    let blockStack: Array<string> = [];
    let macros: Record<string, TwingMacroNode> = {};
    let importedSymbols: Array<TwingParserImportedSymbol> = [{
        method: new Map(),
        template: []
    }];
    let traits: Record<string, TwingTraitNode> = {};
    let embeddedTemplates: Array<TwingModuleNode> = [];
    let embeddedTemplateIndex: number = 1;

    const filterNames = getNames(filters);
    const functionNames = getNames(functions);
    const testNames = getNames(tests);
    const tags = tagHandlers.map(({tag}) => tag);

    const stack: Array<StackEntry> = [];

    const addImportedSymbol: TwingParser["addImportedSymbol"] = (type, alias, name?: string, node?: NodeWithName) => {
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
    const checkConstantExpression = (stackEntry: TwingTokenStream, node: TwingBaseNode): TwingBaseNode | null => {
        if (!(node.is("constant") || node.is("array") || node.is(hashNodeType) || node.is(negativeNodeType) || node.is(positiveNodeType))) {
            return node;
        }

        for (const [, child] of getChildren(node)) {
            if (checkConstantExpression(stackEntry, child) !== null) {
                return child;
            }
        }

        return null;
    };

    const embedTemplate: TwingParser["embedTemplate"] = (template) => {
        template.attributes.index = embeddedTemplateIndex++;

        embeddedTemplates.push(template);
    };

    const filterBodyNodes = (stream: TwingTokenStream, node: TwingBaseNode, nested: boolean = false): TwingBaseNode | null => {
        // check that the body does not contain non-empty output nodes

        if ((node.is(textNodeType) && !isMadeOfWhitespaceOnly(node.attributes.data)) ||
            (!node.is(textNodeType) && !node.is(blockReferenceType) && (node.isAnOutputNode && !node.is(spacelessNodeType)))) {
            if (node.toString().indexOf(String.fromCharCode(0xEF, 0xBB, 0xBF)) > -1) {
                const nodeData = (node.attributes as any).data as string; // todo

                const trailingData = nodeData.substring(3);

                if (trailingData === '' || isMadeOfWhitespaceOnly(trailingData)) {
                    // bypass empty nodes starting with a BOM
                    return null;
                }
            }

            throw createParsingError(
                `A template that extends another one cannot include content outside Twig blocks. Did you forget to put the content inside a {% block %} tag?`,
                node,
                stream.source.resolvedName
            );
        }

        // bypass nodes that "capture" the output
        if (node.isACaptureNode) {
            // a "block" tag in such a node will serve as a block definition AND be displayed in place as well
            return node;
        }

        // to be removed completely in Twig 3.0
        if (!nested && (node.type === "spaceless")) {
            console.warn(`Using the spaceless tag at the root level of a child template in "${stream.source.name}" at line ${node.line} is deprecated since Twig 2.5.0 and will become a syntax error in Twig 3.0.`);
        }

        // "block" tags that are not captured (see above) are only used for defining
        // the content of the block. In such a case, nesting it does not work as
        // expected as the definition is not part of the default template code flow.
        if (nested && (node.type === "block_reference")) {
            console.warn(`Nesting a block definition under a non-capturing node in "${stream.source.name}" at line ${node.line} is deprecated since Twig 2.5.0 and will become a syntax error in Twig 3.0.`);

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

    const getFilterExpressionFactory = (stream: TwingTokenStream, name: string, line: number, column: number) => {
        const {strict} = options;
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

                let src = stream.source;

                message += ` in "${src.name}" at line ${line}.`;

                console.warn(message);
            }
        } else if (strict) {
            const error = createParsingError(`Unknown filter "${name}".`, {line, column}, stream.source.resolvedName);

            error.addSuggestions(name, filterNames);

            throw error;
        }

        return createFilterNode;
    };

    const getFunctionExpressionFactory = (stream: TwingTokenStream, name: string, line: number, column: number) => {
        const {strict} = options;
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

                const source = stream.source;

                message += ` in "${source.name}" at line ${line}.`;

                console.warn(message);
            }
        } else if (strict) {
            const error = createParsingError(`Unknown function "${name}".`, {line, column}, stream.source.resolvedName);

            error.addSuggestions(name, functionNames);

            throw error;
        }
        
        return createFunctionNode;
    };

    const getFunctionNode = (stream: TwingTokenStream, name: string, line: number, column: number): TwingBaseExpressionNode => {
        switch (name) {
            case 'parent':
                parseArguments(stream);

                if (!getBlockStack().length) {
                    throw createParsingError('Calling "parent" outside a block is forbidden.', {line, column}, stream.source.resolvedName);
                }

                if (!parent && !hasTraits()) {
                    throw createParsingError('Calling "parent" on a template that does not extend nor "use" another template is forbidden.', {line, column}, stream.source.resolvedName);
                }

                return createParentFunctionNode(peekBlockStack(), line, column);
            case 'block':
                const blockArgs = parseArguments(stream);
                const keyValuePairs = getKeyValuePairs(blockArgs);

                if (keyValuePairs.length < 1) {
                    throw createParsingError('The "block" function takes one argument (the block name).', {line, column}, stream.source.resolvedName);
                }

                return createBlockFunctionNode(keyValuePairs[0].value, keyValuePairs.length > 1 ? keyValuePairs[1].value : null, line, column);
            case 'attribute':
                const attributeArgs = parseArguments(stream);
                const attributeKeyValuePairs = getKeyValuePairs(attributeArgs);

                if (attributeKeyValuePairs.length < 2) {
                    throw createParsingError('The "attribute" function takes at least two arguments (the variable and the attributes).', {line, column}, stream.source.resolvedName);
                }

                return createAttributeAccessorNode(
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

    const getPrimary = (stream: TwingTokenStream): TwingBaseExpressionNode => {
        let token = stream.current;
        let operator: TwingOperator | null;

        if ((operator = isUnary(token)) !== null) {
            stream.next();

            const expression = parseExpression(stream, operator.precedence);
            const expressionFactory = operator.expressionFactory;

            return parsePostfixExpression(stream, expressionFactory([expression, createBaseNode(null)], token.line, token.column), token);
        } else if (token.test(TokenType.PUNCTUATION, '(')) {
            stream.next();

            const expression = parseExpression(stream);

            stream.expect(TokenType.PUNCTUATION, ')', 'An opened parenthesis is not properly closed');

            return parsePostfixExpression(stream, expression, token);
        }

        return parsePrimaryExpression(stream);
    };

    const getTestName = (stream: TwingTokenStream): string => {
        const {line, column} = stream.current;
        const {strict} = options;

        let name = stream.expect(TokenType.NAME).value;
        let test: Pick<TwingTest, "alternative" | "deprecatedVersion" | "isDeprecated" | "name"> | null = getTestByName(tests, name);

        if (!test) {
            if (stream.test(TokenType.NAME)) {
                // try 2-words tests
                name = name + ' ' + stream.current.value;

                test = getTestByName(tests, name);

                if (test) {
                    stream.next();
                } else {
                    // non-existing two-words test
                    if (!strict) {
                        stream.next();

                        test = {
                            name,
                            isDeprecated: false,
                            alternative: undefined,
                            deprecatedVersion: undefined
                        };
                    }
                }
            } else {
                // non-existing one-word test
                if (!strict) {
                    test = {
                        name,
                        isDeprecated: false,
                        alternative: undefined,
                        deprecatedVersion: undefined
                    };
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

                const source = stream.source;

                message += ` in "${source.name}" at line ${line}.`;

                console.warn(message);
            }

            return name;
        }

        const error = createParsingError(`Unknown test "${name}".`, {line, column}, stream.source.resolvedName);

        error.addSuggestions(name, testNames);

        throw error;
    };

    const getVarName: TwingParser["getVarName"] = (prefix = '__internal_') => {
        return `${prefix}${varNameSalt++}`;
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

        let body: TwingBaseNode | null;

        try {
            body = subparse(stream, tag, test, dropNeedle);

            if (parent !== null && (body = filterBodyNodes(stream, body)) === null) {
                body = createBaseNode(null);
            }
        } catch (error: any) {
            if (!(error as TwingParsingError).source) {
                (error as TwingParsingError).source = stream.source.resolvedName;
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
            stream.source,
            1, 1
        );

        // passed visitors
        let traverse = createNodeTraverser(visitors);

        node = traverse(node) as TwingModuleNode;

        // core visitors
        traverse = createNodeTraverser([
            createCoreNodeVisitor(),
            createEscaperNodeVisitor(
                filters,
                functions
            ),
            createMacroAutoImportNodeVisitor(),
            createSandboxNodeVisitor()
        ]);

        node = traverse(node) as TwingModuleNode;

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
        const {line, column} = stream.current;
        const elements: Array<{
            key?: TwingConstantNode;
            value: TwingBaseExpressionNode;
        }> = [];

        let value: TwingBaseExpressionNode;
        let token: Token;

        stream.expect(TokenType.PUNCTUATION, '(');

        while (!stream.test(TokenType.PUNCTUATION, ')')) {
            if (elements.length > 0) {
                stream.expect(TokenType.PUNCTUATION, ',');
            }

            if (definition) {
                token = stream.expect(TokenType.NAME, null);

                const {line, column} = stream.current;

                value = createNameNode(token.value, line, column);
            } else {
                value = parseExpression(stream, 0, allowArrow);
            }

            let key: TwingConstantNode | undefined = undefined;

            if (namedArguments && (token = stream.nextIf(TokenType.OPERATOR, '='))) {
                if (!value.is("name")) {
                    throw createParsingError(`A parameter name must be a string, "${value.type.toString()}" given.`, value, stream.source.resolvedName);
                }

                key = createConstantNode(value.attributes.name, value.line, value.column);

                if (definition) {
                    value = parsePrimaryExpression(stream);

                    const notConstantNode = checkConstantExpression(stream, value);

                    if (notConstantNode !== null) {
                        throw createParsingError(`A default value for an argument must be a constant (a boolean, a string, a number, or an array).`, notConstantNode, stream.source.resolvedName);
                    }
                } else {
                    value = parseExpression(stream, 0, allowArrow);
                }
            }

            if (definition) {
                if (key === undefined) {
                    key = createConstantNode((value as TwingNameNode).attributes.name, line, column);
                    value = createConstantNode(null, line, column);
                }
            }

            elements.push({
                key,
                value
            });
        }

        stream.expect(TokenType.PUNCTUATION, ')');

        const arrayNode = createArrayNode(elements, line, column);

        return arrayNode;
    };

    const parseArrayExpression = (stream: TwingTokenStream): TwingArrayNode => {
        const {line, column} = stream.current;

        stream.expect(TokenType.PUNCTUATION, '[', 'An array element was expected');

        const elements: Array<TwingBaseExpressionNode> = [];

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
        }), line, column);
    };

    const parseAssignmentExpression: TwingParser["parseAssignmentExpression"] = (stream) => {
        const targets: Record<string, TwingAssignmentNode> = {};
        const {line, column} = stream.current;

        while (true) {
            let token = stream.current;

            if (stream.test(TokenType.OPERATOR) && nameRegExp.exec(token.value)) {
                // in this context, string operators are variable names
                stream.next();
            } else {
                stream.expect(TokenType.NAME, null, 'Only variables can be assigned to');
            }

            let value = token.value;

            if (['true', 'false', 'none', 'null'].indexOf(value.toLowerCase()) > -1) {
                throw createParsingError(`You cannot assign a value to "${value}".`, token, stream.source.resolvedName);
            }

            pushToRecord(targets, createAssignmentNode(value, token.line, token.column));

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        return createArgumentsNode(targets, line, column);
    };

    const parseArrow = (stream: TwingTokenStream): TwingArrowFunctionNode | null => {
        let token: Token;
        let line: number;
        let column: number;
        let names: Record<number, TwingAssignmentNode>;

        // short array syntax (one argument, no parentheses)?
        if (stream.look(1).test(TokenType.ARROW)) {
            line = stream.current.line;
            column = stream.current.column;
            token = stream.expect(TokenType.NAME);
            names = {
                0: createAssignmentNode(token.value, token.line, token.column)
            };

            stream.expect(TokenType.ARROW);

            return createArrowFunctionNode(parseExpression(stream, 0), createBaseNode(null, {}, names), line, column);
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

        stream.look(i).test(TokenType.PUNCTUATION, ')');

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
            token = stream.current;

            if (!token.test(TokenType.NAME)) {
                throw createParsingError(`Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}".`, token, stream.source.resolvedName);
            }

            names[i++] = createAssignmentNode(token.value, token.line, token.column);

            stream.next();

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        stream.expect(TokenType.PUNCTUATION, ')');
        stream.expect(TokenType.ARROW);

        return createArrowFunctionNode(parseExpression(stream, 0), createBaseNode(null, {}, names), line, column);
    };

    const parseConditionalExpression = (stream: TwingTokenStream, expression: TwingBaseExpressionNode): TwingBaseExpressionNode => {
        let expr2: TwingBaseExpressionNode;
        let expr3: TwingBaseExpressionNode;

        while (stream.nextIf(TokenType.PUNCTUATION, '?')) {
            if (!stream.nextIf(TokenType.PUNCTUATION, ':')) {
                expr2 = parseExpression(stream);

                if (stream.nextIf(TokenType.PUNCTUATION, ':')) {
                    expr3 = parseExpression(stream);
                } else {
                    const {line, column} = stream.current;

                    expr3 = createConstantNode('', line, column);
                }
            } else {
                expr2 = expression;
                expr3 = parseExpression(stream);
            }

            const {line, column} = stream.current;

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
        let token = stream.current;
        let operator: TwingOperator | null = null;

        if ((token.value === "is not") || (token.value === "is")) {
            stream.next();

            if (token.value === "is not") {
                expression = parseNotTestExpression(stream, expression);
            } else {
                expression = parseTestExpression(stream, expression);
            }
        } else {
            while (((operator = isBinary(token)) !== null) && operator.precedence >= precedence) {
                stream.next();

                const {expressionFactory} = operator;

                const operand = parseExpression(stream, operator.associativity === "LEFT" ? operator.precedence + 1 : operator.precedence);

                expression = expressionFactory([expression, operand], token.line, token.column);

                token = stream.current;
            }
        }

        if (precedence === 0) {
            return parseConditionalExpression(stream, expression);
        }

        return expression;
    };

    const parseFilterExpression = (stream: TwingTokenStream, node: TwingBaseExpressionNode): TwingFilterNode => {
        stream.next();

        return parseFilterExpressionRaw(stream, node);
    };

    const parseFilterDefinitions: TwingParser["parseFilterDefinitions"] = (stream) => {
        const definitions: ReturnType<TwingParser["parseFilterDefinitions"]> = [];

        while (true) {
            const token = stream.expect(TokenType.NAME);
            const {value, line, column} = token;

            let methodArguments;

            if (!stream.test(TokenType.PUNCTUATION, '(')) {
                methodArguments = createArrayNode([], line, column);
            } else {
                methodArguments = parseArguments(stream, true, false, true);
            }

            definitions.unshift({
                name: value,
                arguments: methodArguments
            })

            if (!stream.test(TokenType.PUNCTUATION, '|')) {
                break;
            }

            stream.next();
        }

        return definitions;
    };

    const parseFilterExpressionRaw: TwingParser["parseFilterExpressionRaw"] = (stream, operand) => {
        let filterNode: TwingFilterNode | null = null;

        while (true) {
            const token = stream.expect(TokenType.NAME);
            const {value, line, column} = token;

            let methodArguments;

            if (!stream.test(TokenType.PUNCTUATION, '(')) {
                methodArguments = createArrayNode([], line, column);
            } else {
                methodArguments = parseArguments(stream, true, false, true);
            }

            const factory = getFilterExpressionFactory(stream, value, line, column);

            if (filterNode === null) {
                filterNode = factory(operand, value, methodArguments, token.line, token.column);
            } else {
                filterNode = factory(filterNode, value, methodArguments, token.line, token.column);
            }

            if (!stream.test(TokenType.PUNCTUATION, '|')) {
                break;
            }

            stream.next();
        }

        return filterNode;
    };

    const parseHashExpression = (stream: TwingTokenStream): TwingHashNode => {
        stream.expect(TokenType.PUNCTUATION, '{', 'A hash element was expected');

        let first = true;

        const elements: Array<{
            key: TwingBaseExpressionNode;
            value: TwingBaseExpressionNode;
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
            let key: TwingBaseExpressionNode;

            if ((token = stream.nextIf(TokenType.STRING)) || (token = stream.nextIf(TokenType.NAME)) || (token = stream.nextIf(TokenType.NUMBER))) {
                key = createConstantNode(token.value, token.line, token.column);
            } else if (stream.test(TokenType.PUNCTUATION, '(')) {
                key = parseExpression(stream);
            } else {
                const {type, line, value, column} = stream.current;

                throw createParsingError(`A hash key must be a quoted string, a number, a name, or an expression enclosed in parentheses (unexpected token "${typeToEnglish(type)}" of value "${value}".`, {line, column}, stream.source.resolvedName);
            }

            stream.expect(TokenType.PUNCTUATION, ':', 'A hash key must be followed by a colon (:)');

            const value = parseExpression(stream);

            elements.push({
                key,
                value
            });
        }

        stream.expect(TokenType.PUNCTUATION, '}', 'An opened hash is not properly closed');

        return createHashNode(elements, stream.current.line, stream.current.column);
    };

    const parseMultiTargetExpression: TwingParser["parseMultiTargetExpression"] = (stream) => {
        const {line, column} = stream.current;

        const targets: Record<number, TwingBaseExpressionNode> = {};

        while (true) {
            pushToRecord(targets, parseExpression(stream));

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        return createArgumentsNode(targets, line, column);
    };

    const parseNotTestExpression = (stream: TwingTokenStream, node: TwingBaseExpressionNode): TwingBaseExpressionNode => {
        const {line, column} = stream.current;

        return createNotNode(parseTestExpression(stream, node), line, column);
    };

    const parsePostfixExpression = (stream: TwingTokenStream, node: TwingBaseExpressionNode, prefixToken: Token): TwingBaseExpressionNode => {
        while (true) {
            let token = stream.current;

            if (token.type === TokenType.PUNCTUATION) {
                if (token.value === '.' || token.value === '[') {
                    node = parseSubscriptExpression(stream, node, prefixToken);
                } else if (token.value === '|') {
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

    const parsePrimaryExpression = (stream: TwingTokenStream): TwingBaseExpressionNode => {
        const token = stream.current;

        let node: TwingBaseExpressionNode;

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
                        if ('(' === stream.current.value) {
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
                    throw createParsingError(`Unexpected operator of value "${token.value}". Did you try to use "===" or "!==" for strict comparison? Use "is same as(value)" instead.`, token, stream.source.resolvedName);
                } else {
                    throw createParsingError(`Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}".`, token, stream.source.resolvedName);
                }
        }

        return parsePostfixExpression(stream, node, token);
    };

    const parseStringExpression = (stream: TwingTokenStream): TwingBaseExpressionNode => {
        const nodes: Array<TwingBaseExpressionNode> = [];

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
            expression = createConcatenateNode([expression, node], node.line, node.column);
        }

        return expression;
    };

    const parseSubscriptExpression = (stream: TwingTokenStream, node: TwingBaseExpressionNode, prefixToken: Token) => {
        let token = stream.next();
        let arg: TwingBaseExpressionNode;
        let type: TwingGetAttributeCallType = "any";

        const {line, column} = token;
        const {line: prefixTokenLine, column: prefixTokenColumn} = prefixToken;
        const elements: Array<TwingBaseExpressionNode> = [];

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
                throw createParsingError('Expected name or number.', {line, column: column + 1}, stream.source.resolvedName);
            }

            if ((node.is("name")) && getImportedTemplate(node.attributes.name)) {
                const name = (arg as TwingConstantNode).attributes.value as string;
                const methodCallNode = createMethodCallNode(node, name, createArrayNodeFromElements(), line, column);

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
                let length: TwingConstantNode;

                if (stream.test(TokenType.PUNCTUATION, ']')) {
                    length = createConstantNode(null, token.line, token.column);
                } else {
                    length = parseExpression(stream) as TwingConstantNode;
                }

                const factory = getFilterExpressionFactory(stream, 'slice', token.line, token.column);
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

        return createAttributeAccessorNode(node, arg, createArrayNodeFromElements(), type, prefixTokenLine, prefixTokenColumn);
    };

    const parseTestExpression = (stream: TwingTokenStream, node: TwingBaseExpressionNode): TwingBaseExpressionNode => {
        const {line, column} = stream.current;
        const name = getTestName(stream);

        let testArguments = createArrayNode([], line, column);

        if (stream.test(TokenType.PUNCTUATION, '(')) {
            testArguments = parseArguments(stream, true);
        }

        // todo: should be part of the Core node visitor
        if ((name === 'defined') && (node.is("name"))) {
            const alias = getImportedMethod(node.attributes.name);

            if (alias !== null) {
                node = createMethodCallNode(alias.node, alias.name, createArrayNode([], node.line, node.column), node.line, node.column);
            }
        }

        return createTestNode(node, name, testArguments, line, column);
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

    const setBlock: TwingParser["setBlock"] = (name, node) => {
        blocks[name] = node;
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

        let {line, column} = stream.current;
        let children: Record<number, TwingBaseNode> = {};
        let i: number = 0;
        let token: Token;

        while (!stream.isEOF()) {
            switch (stream.current.type) {
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

                    token = stream.current;

                    if (token.type !== TokenType.NAME) {
                        throw createParsingError('A block must start with a tag name.', token, stream.source.resolvedName);
                    }

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
                            error = createParsingError(
                                `Unexpected "${token.value}" tag`,
                                token,
                                stream.source.resolvedName
                            );

                            error.appendMessage(` (expecting closing tag for the "${tag}" tag defined line ${line}).`);
                        } else {
                            error = createParsingError(
                                `Unknown "${token.value}" tag.`,
                                token,
                                stream.source.resolvedName
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
                    token = stream.next();

                    if (stream.test(TokenType.TEXT)) {
                        // non-empty comment
                        token = stream.expect(TokenType.TEXT);
                    }

                    stream.expect(TokenType.COMMENT_END);
                    children[i++] = createCommentNode(token.value, token.line, token.column);

                    break;
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
        isMainScope,
        parse,
        parseArguments,
        parseAssignmentExpression,
        parseExpression,
        parseFilterExpressionRaw,
        parseFilterDefinitions,
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
