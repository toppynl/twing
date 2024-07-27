import type {TwingTokenStream} from "./token-stream";
import {TwingTagHandler, TwingTokenParser} from "./tag-handler";
import {TwingNodeVisitor} from "./node-visitor";
import {createParsingError} from "./error/parsing";
import {TwingBaseNode, getChildren, TwingNode, createNode} from "./node";
import {createTextNode} from "./node/text";
import {createPrintNode} from "./node/print";
import {TwingBaseExpressionNode, TwingExpressionNode} from "./node/expression";
import {createTemplateNode, TwingTemplateNode} from "./node/template";
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
    TwingAttributeAccessorCallType
} from "./node/expression/attribute-accessor";
import {TwingArrayNode, createArrayNode} from "./node/expression/array";
import {createMethodCallNode} from "./node/expression/method-call";
import {createHashNode, TwingHashNode} from "./node/expression/hash";
import {TwingSynchronousTest, TwingTest} from "./test";
import {createNotNode} from "./node/expression/unary/not";
import {createConditionalNode} from "./node/expression/conditional";
import {TwingOperator} from "./operator";
import {namePattern, Token} from "twig-lexer";
import {typeToEnglish} from "./lexer";
import {createFunctionNode} from "./node/expression/call/function";
import {createFilterNode, TwingFilterNode} from "./node/expression/call/filter";
import type {TwingTraitNode} from "./node/trait";
import {pushToRecord} from "./helpers/record";
import {TwingFilter, TwingSynchronousFilter} from "./filter";
import {TwingFunction, TwingSynchronousFunction} from "./function";
import {TwingCallableWrapper, TwingSynchronousCallableWrapper} from "./callable-wrapper";
import {TwingBlockNode} from "./node/block";
import {getFunction} from "./helpers/get-function";
import {getFilter} from "./helpers/get-filter";
import {getTest as getTestByName} from "./helpers/get-test";
import {createCoreNodeVisitor} from "./node-visitor/core";
import {createSandboxNodeVisitor} from "./node-visitor/sandbox";
import {createTestNode} from "./node/expression/call/test";
import {createEscaperNodeVisitor} from "./node-visitor/escaper";
import {createApplyTagHandler} from "./tag-handler/apply";
import {createAutoEscapeTagHandler} from "./tag-handler/auto-escape";
import {createBlockTagHandler} from "./tag-handler/block";
import {createDeprecatedTagHandler} from "./tag-handler/deprecated";
import {createDoTagHandler} from "./tag-handler/do";
import {createEmbedTagHandler} from "./tag-handler/embed";
import {createExtendsTagHandler} from "./tag-handler/extends";
import {createFilterTagHandler} from "./tag-handler/filter";
import {createFlushTagHandler} from "./tag-handler/flush";
import {createForTagHandler} from "./tag-handler/for";
import {createFromTagHandler} from "./tag-handler/from";
import {createIfTagHandler} from "./tag-handler/if";
import {createImportTagHandler} from "./tag-handler/import";
import {createIncludeTagHandler} from "./tag-handler/include";
import {createLineTagHandler} from "./tag-handler/line";
import {createMacroTagHandler} from "./tag-handler/macro";
import {createSandboxTagHandler} from "./tag-handler/sandbox";
import {createSetTagHandler} from "./tag-handler/set";
import {createSpacelessTagHandler} from "./tag-handler/spaceless";
import {createUseTagHandler} from "./tag-handler/use";
import {createVerbatimTagHandler} from "./tag-handler/verbatim";
import {createWithTagHandler} from "./tag-handler/with";
import {createSpreadNode} from "./node/expression/spread";
import {getKeyValuePairs} from "./helpers/get-key-value-pairs";

const nameRegExp = new RegExp(namePattern);

type TwingParserImportedSymbolAlias = {
    name: string,
    node: TwingBaseNode<any, {
        name: string;
    }>
};
type TwingParserImportedSymbolType = Map<string, TwingParserImportedSymbolAlias>;
type TwingParserImportedSymbol = {
    method: TwingParserImportedSymbolType;
    template: Array<string>;
};

export type TwingParserOptions = {
    strict?: boolean;
    level?: 2 | 3
};

type ParseTest = [tag: string, test: (token: Token) => boolean];

export interface TwingParser {
    parent: TwingBaseNode | null;

    addImportedSymbol(type: 'template', alias: string): void;

    addImportedSymbol(type: 'method', alias: string, name: string, node: TwingBaseNode<any, {
        name: string;
    }>): void;

    addTrait(trait: TwingTraitNode): void;

    embedTemplate(template: TwingTemplateNode): void;

    getBlock(name: string): TwingBlockNode | null;

    getVarName(prefix?: string): string;

    isMainScope(): boolean;

    parse(stream: TwingTokenStream, tag?: string | null, test?: ParseTest[1] | null): TwingTemplateNode;

    parseArguments(stream: TwingTokenStream, namedArguments?: boolean, definition?: boolean, allowArrow?: true): TwingArrayNode;

    parseAssignmentExpression(stream: TwingTokenStream): TwingBaseNode<null, {}, {
        [key: number]: TwingAssignmentNode;
    }>;

    parseExpression(stream: TwingTokenStream, precedence?: number, allowArrow?: true): TwingExpressionNode;

    parseFilterDefinitions(stream: TwingTokenStream): Array<{
        name: string;
        arguments: TwingArrayNode;
    }>;

    parseFilterExpressionRaw(stream: TwingTokenStream, node: TwingBaseExpressionNode, tag?: string | null): TwingFilterNode;

    parseMultiTargetExpression(stream: TwingTokenStream): TwingBaseNode<null>;

    peekBlockStack(): string;

    popBlockStack(): void;

    popLocalScope(): void;

    pushBlockStack(name: string): void;

    pushLocalScope(): void;

    setBlock(name: string, node: TwingBlockNode): void;

    setMacro(name: string, node: TwingMacroNode): void;

    subparse(stream: TwingTokenStream, tag: string | null, test: ParseTest[1] | null): TwingBaseNode;
}

export type StackEntry = {
    stream: TwingTokenStream;
    parent: TwingBaseExpressionNode | null;
    blocks: Record<string, TwingBlockNode>;
    blockStack: Array<string>;
    macros: Record<string, TwingMacroNode>;
    importedSymbols: Array<TwingParserImportedSymbol>;
    traits: Record<string, TwingTraitNode>;
    embeddedTemplates: Array<TwingTemplateNode>;
};

const getNames = (
    map: Map<string, TwingCallableWrapper | TwingSynchronousCallableWrapper>
): Array<string> => {
    return [...map.values()].map(({name}) => name);
};

export const createParser = (
    unaryOperators: Array<TwingOperator>,
    binaryOperators: Array<TwingOperator>,
    additionalTagHandlers: Array<TwingTagHandler>,
    visitors: Array<TwingNodeVisitor>,
    filters: Map<string, TwingFilter | TwingSynchronousFilter>,
    functions: Map<string, TwingFunction | TwingSynchronousFunction>,
    tests: Map<string, TwingTest | TwingSynchronousTest>,
    options?: TwingParserOptions
): TwingParser => {
    const strict = options?.strict !== undefined ? options.strict : true;
    const level = options?.level || 3;

    // operators
    const binaryOperatorsRegister: Map<string, TwingOperator> = new Map(binaryOperators
        .filter((operator) => operator.specificationLevel <= level)
        .map((operator) => [operator.name, operator])
    );

    const unaryOperatorsRegister: Map<string, TwingOperator> = new Map(unaryOperators
        .map((operator) => [operator.name, operator])
    );

    // tag handlers
    const tagHandlers: Array<TwingTagHandler> = [
        createApplyTagHandler(),
        createAutoEscapeTagHandler(),
        createBlockTagHandler(),
        createDeprecatedTagHandler(),
        createDoTagHandler(),
        createEmbedTagHandler(),
        createExtendsTagHandler(),
        createFlushTagHandler(),
        createForTagHandler(),
        createFromTagHandler(),
        createIfTagHandler(),
        createImportTagHandler(),
        createIncludeTagHandler(),
        createLineTagHandler(),
        createMacroTagHandler(),
        createSandboxTagHandler(),
        createSetTagHandler(),
        createUseTagHandler(),
        createVerbatimTagHandler(),
        createWithTagHandler()
    ];

    if (level === 2) {
        tagHandlers.push(...[
            createFilterTagHandler(),
            createSpacelessTagHandler(),
        ]);
    }

    tagHandlers.push(...additionalTagHandlers);

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
    let embeddedTemplates: Array<TwingTemplateNode> = [];
    let embeddedTemplateIndex: number = 1;

    const filterNames = getNames(filters);
    const functionNames = getNames(functions);
    const testNames = getNames(tests);
    const tags = tagHandlers.map(({tag}) => tag);

    const stack: Array<StackEntry> = [];

    const addImportedSymbol: TwingParser["addImportedSymbol"] = (type, alias, name?: string, node?: TwingBaseNode<any, {
        name: string;
    }>) => {
        const localScope = importedSymbols[0];

        if (type === "method") {
            localScope[type].set(alias, {
                name: name!,
                node: node!
            });
        }
        else {
            localScope[type].push(alias);
        }
    };

    const addTrait: TwingParser["addTrait"] = (trait) => {
        pushToRecord(traits, trait);
    };

    // checks that the node only contains "constant" elements
    const checkConstantExpression = (stackEntry: TwingTokenStream, node: TwingBaseNode): TwingBaseNode | null => {
        if (!(
            (node as TwingNode).type === "constant"
            || (node as TwingNode).type === "array"
            || (node as TwingNode).type === "hash"
            || (node as TwingNode).type === "negative"
            || (node as TwingNode).type === "positive"
        )) {
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

    const filterChildBodyNode = (stream: TwingTokenStream, node: TwingBaseNode, nested: boolean = false): TwingBaseNode | null => {
        // non-empty text nodes are not allowed as direct child of a 
        const testedNode = node as TwingNode;

        if (testedNode.type === "text" && !isMadeOfWhitespaceOnly(testedNode.attributes.data)) {
            const {data} = testedNode.attributes;

            if (data.indexOf(String.fromCharCode(0xEF, 0xBB, 0xBF)) > -1) {
                const trailingData = data.substring(3);

                if (trailingData === '' || isMadeOfWhitespaceOnly(trailingData)) {
                    // bypass empty nodes starting with a BOM
                    return null;
                }
            }

            throw createParsingError(
                `A template that extends another one cannot include content outside Twig blocks. Did you forget to put the content inside a {% block %} tag?`,
                node,
                stream.source
            );
        }

        const {type} = (node as TwingNode);

        // bypass nodes that "capture" the output
        if (type === "set") {
            return node;
        }

        // to be removed completely in Twig 3.0
        if (!nested && (type === "spaceless")) {
            console.warn(`Using the spaceless tag at the root level of a child template in "${stream.source.name}" at line ${node.line} is deprecated since Twig 2.5.0 and will become a syntax error in Twig 3.0.`);
        }

        // "block" tags that are not capturing (see above) are only used for defining
        // the content of the block. In such a case, nesting it does not work as
        // expected as the definition is not part of the default template code flow.
        if (nested && (type === "block_reference")) {
            if (level >= 3) {
                throw createParsingError(`A block definition cannot be nested under non-capturing nodes.`, node, stream.source);
            }
            else {
                console.warn(`Nesting a block definition under a non-capturing node in "${stream.source.name}" at line ${node.line} is deprecated since Twig 2.5.0 and will become a syntax error in Twig 3.0.`);

                return null;
            }
        }

        if (type === "block_reference" || type === "print" || type === "text") {
            return null;
        }

        // here, nested means "being at the root level of a child template"
        // we need to discard the wrapping node for the "body" node
        nested = nested || (type !== null);

        for (const [key, child] of getChildren(node)) {
            if (child !== null && (filterChildBodyNode(stream, child, nested) === null)) {

                delete (node.children as any)[key];
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
        }
        else if (strict) {
            const error = createParsingError(`Unknown filter "${name}".`, {line, column}, stream.source);

            error.addSuggestions(name, filterNames);

            throw error;
        }

        return createFilterNode;
    };

    const getFunctionExpressionFactory = (stream: TwingTokenStream, name: string, line: number, column: number) => {
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
        }
        else if (strict) {
            const error = createParsingError(`Unknown function "${name}".`, {line, column}, stream.source);

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
                    throw createParsingError('Calling "parent" outside a block is forbidden.', {
                        line,
                        column
                    }, stream.source);
                }

                if (!parent && !hasTraits()) {
                    throw createParsingError('Calling "parent" on a template that does not extend nor "use" another template is forbidden.', {
                        line,
                        column
                    }, stream.source);
                }

                return createParentFunctionNode(peekBlockStack(), line, column);
            case 'block':
                const blockArgs = parseArguments(stream);
                const keyValuePairs = getKeyValuePairs(blockArgs);

                if (keyValuePairs.length < 1) {
                    throw createParsingError('The "block" function takes one argument (the block name).', {
                        line,
                        column
                    }, stream.source);
                }

                return createBlockFunctionNode(keyValuePairs[0].value, keyValuePairs.length > 1 ? keyValuePairs[1].value : null, line, column);
            case 'attribute':
                const attributeArgs = parseArguments(stream);
                const attributeKeyValuePairs = getKeyValuePairs(attributeArgs);

                if (attributeKeyValuePairs.length < 2) {
                    throw createParsingError('The "attribute" function takes at least two arguments (the variable and the attributes).', {
                        line,
                        column
                    }, stream.source);
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

            return parsePostfixExpression(stream, expressionFactory([expression, createNode()], token.line, token.column), token);
        }
        else if (token.test("PUNCTUATION", '(')) {
            stream.next();

            const expression = parseExpression(stream);

            stream.expect("PUNCTUATION", ')', 'An opened parenthesis is not properly closed');

            return parsePostfixExpression(stream, expression, token);
        }

        return parsePrimaryExpression(stream);
    };

    const getTestName = (stream: TwingTokenStream): string => {
        const {line, column} = stream.current;

        let name = stream.expect("NAME").value;
        let test: Pick<TwingTest, "alternative" | "deprecatedVersion" | "isDeprecated" | "name"> | null = getTestByName(tests, name);

        if (!test) {
            if (stream.test("NAME")) {
                // try 2-words tests
                name = name + ' ' + stream.current.value;

                test = getTestByName(tests, name);

                if (test) {
                    stream.next();
                }
                else {
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
            }
            else {
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

        const error = createParsingError(`Unknown test "${name}".`, {line, column}, stream.source);

        error.addSuggestions(name, testNames);

        throw error;
    };

    const getVarName: TwingParser["getVarName"] = (prefix = '__internal_') => {
        return `${prefix}${varNameSalt++}`;
    };

    const hasTraits = () => {
        return Object.keys(traits).length > 0
    };

    const isBinary = (token: Token): {
        associativity: TwingOperator["associativity"];
        expressionFactory: TwingOperator["expressionFactory"];
        name: TwingOperator["name"];
        precedence: TwingOperator["precedence"];
    } | {
        expressionFactory: null;
        name: "is" | "is not";
        precedence: TwingOperator["precedence"];
    } | null => {
        if (token.value === "is" || token.value === "is not") {
            return {
                expressionFactory: null,
                name: token.value,
                precedence: 100
            };
        }

        return (token.test("OPERATOR") && binaryOperatorsRegister.get(token.value)) || null;
    };

    const isUnary = (token: Token): TwingOperator | null => {
        return (token.test("OPERATOR") && unaryOperatorsRegister.get(token.value)) || null;
    };

    const parse: TwingParser["parse"] = (stream, tag = null, test = null) => {
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

        let body: TwingBaseNode | null = subparse(stream, tag, test);

        if (parent !== null && (body = filterChildBodyNode(stream, body)) === null) {
            body = createNode();
        }

        let node = createTemplateNode(
            body,
            parent,
            createNode(blocks),
            createNode(macros),
            createNode(traits),
            embeddedTemplates,
            stream.source,
            1, 1
        );

        // passed visitors
        let traverse = createNodeTraverser(visitors);

        node = traverse(node, stream.source) as TwingTemplateNode;

        // core visitors
        traverse = createNodeTraverser([
            createCoreNodeVisitor(),
            createEscaperNodeVisitor(),
            createSandboxNodeVisitor()
        ]);

        node = traverse(node, stream.source) as TwingTemplateNode;

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
     * @param stream
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

        let value: TwingExpressionNode;
        let token: Token;

        stream.expect("PUNCTUATION", '(');

        while (!stream.test("PUNCTUATION", ')')) {
            if (elements.length > 0) {
                stream.expect("PUNCTUATION", ',');
            }

            if (definition) {
                token = stream.expect("NAME", null);

                const {line, column} = stream.current;

                value = createNameNode(token.value, line, column);
            }
            else {
                value = parseExpression(stream, 0, allowArrow);
            }

            let key: TwingConstantNode | undefined = undefined;

            if (namedArguments && (token = stream.nextIf("OPERATOR", '='))) {
                if (value.type !== "name") {
                    throw createParsingError(`A parameter name must be a string, "${value.type.toString()}" given.`, value, stream.source);
                }

                key = createConstantNode(value.attributes.name, value.line, value.column);

                if (definition) {
                    value = parsePrimaryExpression(stream);

                    const notConstantNode = checkConstantExpression(stream, value);

                    if (notConstantNode !== null) {
                        throw createParsingError(`A default value for an argument must be a constant (a boolean, a string, a number, or an array).`, notConstantNode, stream.source);
                    }
                }
                else {
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

        stream.expect("PUNCTUATION", ')');

        const arrayNode = createArrayNode(elements, line, column);

        return arrayNode;
    };

    const parseArrayExpression = (stream: TwingTokenStream): TwingArrayNode => {
        const {line, column} = stream.current;

        stream.expect("PUNCTUATION", '[', 'An array element was expected');

        const elements: Array<TwingBaseExpressionNode> = [];

        let first = true;

        while (!stream.test("PUNCTUATION", ']')) {
            if (!first) {
                stream.expect("PUNCTUATION", ',', 'An array element must be followed by a comma');

                // trailing ,?
                if (stream.test("PUNCTUATION", ']')) {
                    break;
                }
            }

            first = false;

            if (stream.test("SPREAD_OPERATOR")) {
                const {current} = stream;

                stream.next();

                const expression = parseExpression(stream);
                const spreadNode = createSpreadNode(expression, current.line, current.column);

                elements.push(spreadNode);
            }
            else {
                elements.push(parseExpression(stream));
            }
        }

        stream.expect("PUNCTUATION", ']', 'An opened array is not properly closed');

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

            if (stream.test("OPERATOR") && nameRegExp.exec(token.value)) {
                // in this context, string operators are variable names
                stream.next();
            }
            else {
                stream.expect("NAME", null, 'Only variables can be assigned to');
            }

            let value = token.value;

            if (['true', 'false', 'none', 'null'].indexOf(value.toLowerCase()) > -1) {
                throw createParsingError(`You cannot assign a value to "${value}".`, token, stream.source);
            }

            pushToRecord(targets, createAssignmentNode(value, token.line, token.column));

            if (!stream.nextIf("PUNCTUATION", ',')) {
                break;
            }
        }

        return createNode(targets, line, column);
    };

    const parseArrow = (stream: TwingTokenStream): TwingArrowFunctionNode | null => {
        let token: Token;
        let line: number;
        let column: number;
        let names: Record<number, TwingAssignmentNode>;

        // short array syntax (one argument, no parentheses)?
        if (stream.look(1).test("ARROW")) {
            line = stream.current.line;
            column = stream.current.column;
            token = stream.expect("NAME");
            names = {
                0: createAssignmentNode(token.value, token.line, token.column)
            };

            stream.expect("ARROW");

            return createArrowFunctionNode(parseExpression(stream, 0), createNode(names), line, column);
        }

        // first, determine if we are parsing an arrow function by finding => (long form)
        let i: number = 0;

        if (!stream.look(i).test("PUNCTUATION", '(')) {
            return null;
        }

        ++i;

        while (true) {
            // variable name
            ++i;

            if (!stream.look(i).test("PUNCTUATION", ',')) {
                break;
            }

            ++i;
        }

        stream.look(i).test("PUNCTUATION", ')');

        ++i;

        if (!stream.look(i).test("ARROW")) {
            return null;
        }

        // yes, let's parse it properly
        token = stream.expect("PUNCTUATION", '(');
        line = token.line;
        column = token.column;
        names = {};

        i = 0;

        while (true) {
            token = stream.current;

            if (!token.test("NAME")) {
                throw createParsingError(`Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}".`, token, stream.source);
            }

            names[i++] = createAssignmentNode(token.value, token.line, token.column);

            stream.next();

            if (!stream.nextIf("PUNCTUATION", ',')) {
                break;
            }
        }

        stream.expect("PUNCTUATION", ')');
        stream.expect("ARROW");

        return createArrowFunctionNode(parseExpression(stream, 0), createNode(names), line, column);
    };

    const parseConditionalExpression = (stream: TwingTokenStream, expression: TwingBaseExpressionNode): TwingBaseExpressionNode => {
        let expr2: TwingBaseExpressionNode;
        let expr3: TwingBaseExpressionNode;

        while (stream.nextIf("PUNCTUATION", '?')) {
            if (!stream.nextIf("PUNCTUATION", ':')) {
                expr2 = parseExpression(stream);

                if (stream.nextIf("PUNCTUATION", ':')) {
                    expr3 = parseExpression(stream);
                }
                else {
                    const {line, column} = stream.current;

                    expr3 = createConstantNode('', line, column);
                }
            }
            else {
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
        let operator: ReturnType<typeof isBinary> = null;

        while (((operator = isBinary(token)) !== null && operator.precedence >= precedence)) {
            stream.next();

            if (operator.expressionFactory === null) {
                expression = parseTestExpression(stream, expression);

                if (operator.name === "is not") {
                    const {line, column} = stream.current;

                    expression = createNotNode(expression, line, column);
                }
            }
            else {
                const {expressionFactory} = operator;

                const operand = parseExpression(stream, operator.associativity === "LEFT" ? operator.precedence + 1 : operator.precedence, true);

                expression = expressionFactory([expression, operand], token.line, token.column);
            }

            token = stream.current;
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
            const token = stream.expect("NAME");
            const {value, line, column} = token;

            getFilterExpressionFactory(stream, value, token.line, token.column);

            let methodArguments;

            if (!stream.test("PUNCTUATION", '(')) {
                methodArguments = createArrayNode([], line, column);
            }
            else {
                methodArguments = parseArguments(stream, true, false, true);
            }

            definitions.unshift({
                name: value,
                arguments: methodArguments
            })

            if (!stream.test("PUNCTUATION", '|')) {
                break;
            }

            stream.next();
        }

        return definitions;
    };

    const parseFilterExpressionRaw: TwingParser["parseFilterExpressionRaw"] = (stream, operand) => {
        let filterNode: TwingFilterNode | null = null;

        while (true) {
            const token = stream.expect("NAME");
            const {value, line, column} = token;

            let methodArguments;

            if (!stream.test("PUNCTUATION", '(')) {
                methodArguments = createArrayNode([], line, column);
            }
            else {
                methodArguments = parseArguments(stream, true, false, true);
            }

            const factory = getFilterExpressionFactory(stream, value, line, column);

            if (filterNode === null) {
                filterNode = factory(operand, value, methodArguments, token.line, token.column);
            }
            else {
                filterNode = factory(filterNode, value, methodArguments, token.line, token.column);
            }

            if (!stream.test("PUNCTUATION", '|')) {
                break;
            }

            stream.next();
        }

        return filterNode;
    };

    const parseHashExpression = (stream: TwingTokenStream): TwingHashNode => {
        stream.expect("PUNCTUATION", '{', 'A hash element was expected');

        let first = true;

        const elements: Array<{
            key: TwingBaseNode;
            value: TwingBaseExpressionNode;
        }> = [];

        while (!stream.test("PUNCTUATION", '}')) {
            if (!first) {
                stream.expect("PUNCTUATION", ',', 'A hash value must be followed by a comma');

                // trailing ,?
                if (stream.test("PUNCTUATION", '}')) {
                    break;
                }
            }

            first = false;

            if (stream.test("SPREAD_OPERATOR")) {
                const {current} = stream;

                stream.next();

                const expression = parseExpression(stream);
                const spreadNode = createSpreadNode(expression, current.line, current.column);

                elements.push({
                    key: createNode(),
                    value: spreadNode
                });

                continue;
            }

            // a hash key can be:
            //
            //  * a number -- 12
            //  * a string -- 'a'
            //  * a name, which is equivalent to a string -- a
            //  * an expression, which must be enclosed in parentheses -- (1 + 2)
            let token;
            let key: TwingBaseExpressionNode;

            if (token = stream.nextIf("NAME")) {
                key = createConstantNode(token.value, token.line, token.column);

                // {a} is a shortcut for {a:a}
                if (stream.test("PUNCTUATION", [',', '}'])) {
                    elements.push({
                        key,
                        value: createNameNode(token.value, token.line, token.column)
                    });

                    continue;
                }
            }
            else if ((token = stream.nextIf("STRING")) || (token = stream.nextIf("NUMBER"))) {
                key = createConstantNode(token.value, token.line, token.column);
            }
            else if (stream.test("PUNCTUATION", '(')) {
                key = parseExpression(stream);
            }
            else {
                const {type, line, value, column} = stream.current;

                throw createParsingError(`A hash key must be a quoted string, a number, a name, or an expression enclosed in parentheses (unexpected token "${typeToEnglish(type)}" of value "${value}".`, {
                    line,
                    column
                }, stream.source);
            }

            stream.expect("PUNCTUATION", ':', 'A hash key must be followed by a colon (:)');

            const value = parseExpression(stream);

            elements.push({
                key,
                value
            });
        }

        stream.expect("PUNCTUATION", '}', 'An opened hash is not properly closed');

        return createHashNode(elements, stream.current.line, stream.current.column);
    };

    const parseMultiTargetExpression: TwingParser["parseMultiTargetExpression"] = (stream) => {
        const {line, column} = stream.current;

        const targets: Record<number, TwingBaseExpressionNode> = {};

        while (true) {
            pushToRecord(targets, parseExpression(stream));

            if (!stream.nextIf("PUNCTUATION", ',')) {
                break;
            }
        }

        return createNode(targets, line, column);
    };

    const parsePostfixExpression = (stream: TwingTokenStream, node: TwingBaseExpressionNode, prefixToken: Token): TwingBaseExpressionNode => {
        while (true) {
            let token = stream.current;

            if (token.type === "PUNCTUATION") {
                if (token.value === '.' || token.value === '[') {
                    node = parseSubscriptExpression(stream, node, prefixToken);
                }
                else if (token.value === '|') {
                    node = parseFilterExpression(stream, node);
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        }

        return node;
    };

    const parsePrimaryExpression = (stream: TwingTokenStream): TwingBaseExpressionNode => {
        const token = stream.current;

        let node: TwingBaseExpressionNode;

        switch (token.type) {
            case "NAME":
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
                        }
                        else {
                            node = createNameNode(token.value, token.line, token.column);
                        }
                }
                break;

            case "NUMBER":
                stream.next();
                node = createConstantNode(token.value, token.line, token.column);
                break;

            case "STRING":
            case "INTERPOLATION_START":
                node = parseStringExpression(stream);
                break;

            case "OPERATOR":
                let match = nameRegExp.exec(token.value);

                if (match !== null && match[0] === token.value) {
                    // in this context, string operators are variable names
                    stream.next();
                    node = createNameNode(token.value, token.line, token.column);

                    break;
                }
                else if (unaryOperatorsRegister.has(token.value)) {
                    const operator = unaryOperatorsRegister.get(token.value)!;

                    stream.next();

                    const expression = parsePrimaryExpression(stream);
                    const {expressionFactory} = operator;

                    node = expressionFactory([expression, createNode()], token.line, token.column);

                    break;
                }

            default:
                if (token.test("PUNCTUATION", '[')) {
                    node = parseArrayExpression(stream);
                }
                else if (token.test("PUNCTUATION", '{')) {
                    node = parseHashExpression(stream);
                }
                else if (token.test("OPERATOR", '=') && (stream.look(-1).value === '==' || stream.look(-1).value === '!=')) {
                    throw createParsingError(`Unexpected operator of value "${token.value}". Did you try to use "===" or "!==" for strict comparison? Use "is same as(value)" instead.`, token, stream.source);
                }
                else {
                    throw createParsingError(`Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}".`, token, stream.source);
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
            if (nextCanBeString && (token = stream.nextIf("STRING"))) {
                nodes.push(createConstantNode(token.value, token.line, token.column));
                nextCanBeString = false;
            }
            else if (stream.nextIf("INTERPOLATION_START")) {
                nodes.push(parseExpression(stream));
                stream.expect("INTERPOLATION_END");
                nextCanBeString = true;
            }
            else {
                break;
            }
        }

        let expression = nodes.shift()!;

        for (const node of nodes) {
            expression = createConcatenateNode([expression, node], node.line, node.column);
        }

        return expression;
    };

    const parseSubscriptExpression = (stream: TwingTokenStream, node: TwingExpressionNode, prefixToken: Token) => {
        let token = stream.next();
        let attribute: TwingBaseExpressionNode;
        let type: TwingAttributeAccessorCallType = "any";

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

            if ((token.type === "NAME") || (token.type === "NUMBER") || (token.type === "OPERATOR" && (match !== null))) {
                attribute = createConstantNode(token.value, line, column);

                if (stream.test("PUNCTUATION", '(')) {
                    type = "method";

                    const argumentsNode = parseArguments(stream);

                    for (const {value} of getKeyValuePairs(argumentsNode)) {
                        elements.push(value);
                    }
                }
            }
            else {
                throw createParsingError('Expected name or number.', {line, column: column + 1}, stream.source);
            }

            if ((node.type === "name") && (node.attributes.name === '_self' || getImportedTemplate(node.attributes.name))) {
                const name = (attribute as TwingConstantNode<string>).attributes.value;
                const methodCallNode = createMethodCallNode(node, name, createArrayNodeFromElements(), line, column);

                return methodCallNode;
            }
        }
        else {
            type = "array";

            // slice?
            let slice = false;

            if (stream.test("PUNCTUATION", ':')) {
                slice = true;
                attribute = createConstantNode(0, token.line, token.column);
            }
            else {
                attribute = parseExpression(stream);
            }

            if (stream.nextIf("PUNCTUATION", ':')) {
                slice = true;
            }

            if (slice) {
                let length: TwingConstantNode;

                if (stream.test("PUNCTUATION", ']')) {
                    length = createConstantNode(null, token.line, token.column);
                }
                else {
                    length = parseExpression(stream) as TwingConstantNode;
                }

                const factory = getFilterExpressionFactory(stream, 'slice', token.line, token.column);
                const filterArguments = createArrayNode([
                    {
                        key: createConstantNode(0, line, column),
                        value: attribute
                    },
                    {
                        key: createConstantNode(1, line, column),
                        value: length
                    }
                ], 1, 1);
                const filter = factory(node, 'slice', filterArguments, token.line, token.column);

                stream.expect("PUNCTUATION", ']');

                return filter;
            }

            stream.expect("PUNCTUATION", ']');
        }

        return createAttributeAccessorNode(node, attribute, createArrayNodeFromElements(), type, prefixTokenLine, prefixTokenColumn);
    };

    const parseTestExpression = (stream: TwingTokenStream, node: TwingExpressionNode): TwingBaseExpressionNode => {
        const {line, column} = stream.current;
        const name = getTestName(stream);

        let testArguments = createArrayNode([], line, column);

        if (stream.test("PUNCTUATION", '(')) {
            testArguments = parseArguments(stream, true);
        }

        if ((name === 'defined') && (node.type === "name")) {
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

    const subparse: TwingParser["subparse"] = (stream, tag, test) => {
        // token parsers
        if (tokenParsers.size === 0) {
            for (const handler of tagHandlers) {
                tokenParsers.set(handler.tag, handler.initialize(parser, level));
            }
        }

        let {line, column} = stream.current;
        let children: Record<number, TwingBaseNode> = {};
        let i: number = 0;
        let token: Token;

        while (!stream.isEOF()) {
            switch (stream.current.type) {
                case "TEXT":
                    token = stream.next();

                    children[i++] = createTextNode(token.value, token.line, token.column);

                    break;
                case "VARIABLE_START":
                    token = stream.next();

                    const expression = parseExpression(stream);

                    stream.expect("VARIABLE_END");
                    children[i++] = createPrintNode(expression, token.line, token.column);

                    break;
                case "TAG_START":
                    stream.next();

                    token = stream.current;

                    if (token.type !== "NAME") {
                        throw createParsingError('A block must start with a tag name.', token, stream.source);
                    }

                    if ((test !== null) && test(token)) {
                        if (Object.keys(children).length === 1) {
                            return children[0];
                        }

                        return createNode(children, line, column);
                    }

                    if (!tokenParsers.has(token.value)) {
                        let error;

                        if (test !== null) {
                            error = createParsingError(
                                `Unexpected "${token.value}" tag`,
                                token,
                                stream.source
                            );

                            error.appendMessage(` (expecting closing tag for the "${tag}" tag defined line ${line}).`);
                        }
                        else {
                            error = createParsingError(
                                `Unknown "${token.value}" tag.`,
                                token,
                                stream.source
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
                case "COMMENT_START":
                    token = stream.next();

                    if (stream.test("TEXT")) {
                        // non-empty comment
                        token = stream.expect("TEXT");
                    }

                    stream.expect("COMMENT_END");
                    children[i++] = createCommentNode(token.value, token.line, token.column);

                    break;
            }
        }

        if (Object.keys(children).length === 1) {
            return children[0];
        }

        return createNode(children, line, column);
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
