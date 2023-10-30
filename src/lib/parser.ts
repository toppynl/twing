import {TwingEnvironment} from "./environment";
import {TwingTokenStream} from "./token-stream";
import {BlockNode} from "./node/block";
import {TwingTokenParserInterface} from "./token-parser-interface";
import {TwingNodeVisitorInterface} from "./node-visitor-interface";
import {TwingErrorSyntax} from "./error/syntax";
import {createBaseNode, getChildren, getChildrenCount, Node} from "./node";
import {createTextNode, textNodeType} from "./node/text";
import {createPrintNode} from "./node/print";
import {ExpressionNode} from "./node/expression";
import {BodyNode, createBodyNode} from "./node/body";
import {createModuleNode, ModuleNode} from "./node/module";
import {TwingNodeTraverser} from "./node-traverser";
import {MacroNode} from "./node/macro";
import {TokenParser} from "./token-parser";
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
import {ArrayNode, createArrayNode} from "./node/expression/array";
import {createMethodCallNode} from "./node/expression/method-call";
import {createHashNode, HashNode} from "./node/expression/hash";
import {TwingTest} from "./test";
import {createNotNode} from "./node/expression/unary/not";
import {createConditionalNode} from "./node/expression/conditional";
import {TwingOperator, TwingOperatorAssociativity} from "./operator";
import {namePattern, Token, TokenType} from "twig-lexer";
import {typeToEnglish} from "./lexer";
import {createFunctionNode} from "./node/expression/call/function";
import {createFilterNode} from "./node/expression/call/filter";
import type {TraitNode} from "./node/trait";
import {getRecordSize, pushToRecord} from "./helpers/record";
import {ArgumentsNode, createArgumentsNode} from "./node/expression/arguments";
import {blockReferenceType} from "./node/block-reference";
import {spacelessNodeType} from "./node/spaceless";

const sha256 = require('crypto-js/sha256');
const hex = require('crypto-js/enc-hex');

class TwingParserStackEntry {
    stream: TwingTokenStream;
    parent: ExpressionNode;
    blocks: Record<string, BodyNode>;
    blockStack: Array<string>;
    macros: Record<string, MacroNode>;
    importedSymbols: Array<Map<string, Map<string, { node: BaseNameNode<any>, name: string }>>>;
    traits: Record<string, TraitNode>;
    embeddedTemplates: Array<ModuleNode>;

    constructor(stream: TwingTokenStream, parent: ExpressionNode = null, blocks: Record<string, BodyNode>, blockStack: Array<string>, macros: Record<string, MacroNode>, importedSymbols: Array<Map<string, Map<string, { name: string, node: BaseNameNode<any> }>>>, traits: Record<string, TraitNode>, embeddedTemplates: Array<ModuleNode>) {
        this.stream = stream;
        this.parent = parent;
        this.blocks = blocks;
        this.blockStack = blockStack;
        this.macros = macros;
        this.importedSymbols = importedSymbols;
        this.traits = traits;
        this.embeddedTemplates = embeddedTemplates;
    }
}

const nameRegExp = new RegExp(namePattern);

type TwingParserImportedSymbolAlias = {
    name: string,
    node: BaseNameNode<any>
};
type TwingParserImportedSymbolType = Map<string, TwingParserImportedSymbolAlias>;
type TwingParserImportedSymbol = Map<string, TwingParserImportedSymbolType>;

export type TwingParserOptions = {
    strict: boolean;
};

export class TwingParser {
    private stack: Array<TwingParserStackEntry> = [];
    private stream: TwingTokenStream;
    private parent: ExpressionNode;
    private handlers: Map<string, TwingTokenParserInterface> = null;
    private blocks: Record<string, BodyNode>;
    private blockStack: Array<string>;
    private macros: Record<string, MacroNode>;
    private readonly env: TwingEnvironment;
    private importedSymbols: Array<TwingParserImportedSymbol>;
    private traits: Record<string, TraitNode>;
    private embeddedTemplates: Array<ModuleNode> = [];
    private varNameSalt: number = 0;
    private embeddedTemplateIndex: number = 1;
    private unaryOperators: Map<string, TwingOperator>;
    private binaryOperators: Map<string, TwingOperator>;
    private tags: Array<string>;

    protected readonly options: TwingParserOptions;

    constructor(
        env: TwingEnvironment,
        unaryOperators: Map<string, TwingOperator>,
        binaryOperators: Map<string, TwingOperator>,
        private readonly tokenParsers: Array<TwingTokenParserInterface>,
        private readonly visitors: Array<TwingNodeVisitorInterface>,
        private readonly filterNames: Array<string>,
        private readonly functionNames: Array<string>,
        private readonly testNames: Array<string>,
        options?: TwingParserOptions
    ) {
        this.env = env;
        this.unaryOperators = unaryOperators;
        this.binaryOperators = binaryOperators;
        this.options = Object.assign({}, {
            strict: true
        }, options);
        this.tags = this.tokenParsers.map((tokenParser) => tokenParser.getTag());
    }

    getVarName(prefix: string = '__internal_'): string {
        return `${prefix}${hex.stringify(sha256('TwingParser::getVarName' + this.stream.getSourceContext().getCode() + this.varNameSalt++))}`;
    }

    parse(stream: TwingTokenStream, test: Array<any> = null, dropNeedle: boolean = false): ModuleNode {
        this.stack.push(new TwingParserStackEntry(
            this.stream,
            this.parent,
            this.blocks,
            this.blockStack,
            this.macros,
            this.importedSymbols,
            this.traits,
            this.embeddedTemplates
        ));

        // tag handlers
        if (this.handlers === null) {
            this.handlers = new Map();

            for (let handler of this.tokenParsers) {
                handler.setParser(this);

                this.handlers.set(handler.getTag(), handler);
            }
        }

        this.stream = stream;
        this.parent = null;
        this.blocks = {};
        this.macros = {};
        this.traits = {};
        this.blockStack = [];
        this.importedSymbols = [new Map()];
        this.embeddedTemplates = [];
        this.varNameSalt = 0;

        let body: Node;

        try {
            body = this.subparse(test, dropNeedle);

            if (this.parent !== null && (body = this.filterBodyNodes(body)) === null) {
                body = createBaseNode(null);
            }
        } catch (e) {
            if (e instanceof TwingErrorSyntax) {
                if (!e.getSourceContext()) {
                    e.setSourceContext(this.stream.getSourceContext());
                }
            }

            throw e;
        }

        let node = createModuleNode(
            createBodyNode(body, 1, 1),
            this.parent,
            createBaseNode(null, {}, this.blocks),
            createBaseNode(null, {}, this.macros),
            createBaseNode(null, {}, this.traits),
            this.embeddedTemplates,
            stream.getSourceContext(),
            1, 1
        );

        let traverser = new TwingNodeTraverser(this.env, this.visitors);

        node = traverser.traverse(node) as ModuleNode;

        // restore previous stack so previous parse() call can resume working
        let stack = this.stack.pop();

        this.stream = stack.stream;
        this.parent = stack.parent;
        this.blocks = stack.blocks;
        this.blockStack = stack.blockStack;
        this.macros = stack.macros;
        this.importedSymbols = stack.importedSymbols;
        this.traits = stack.traits;
        this.embeddedTemplates = stack.embeddedTemplates;

        return node;
    }

    getParent(): ExpressionNode {
        return this.parent;
    }

    setParent(parent: ExpressionNode) {
        this.parent = parent;
    }

    subparse(test: Array<any>, dropNeedle: boolean = false): Node {
        let lineno = this.getCurrentToken().line;
        let rv: Record<number, Node> = {};
        let i: number = 0;
        let token;

        while (!this.stream.isEOF()) {
            switch (this.getCurrentToken().type) {
                case TokenType.TEXT:
                    token = this.stream.next();
                    rv[i++] = createTextNode(token.value, token.line, token.column);

                    break;
                case TokenType.VARIABLE_START:
                    token = this.stream.next();
                    let expression = this.parseExpression();

                    this.stream.expect(TokenType.VARIABLE_END);
                    rv[i++] = createPrintNode(expression, token.line, token.column);

                    break;
                case TokenType.TAG_START:
                    this.stream.next();
                    token = this.getCurrentToken();

                    if (token.type !== TokenType.NAME) {
                        throw new TwingErrorSyntax('A block must start with a tag name.', token.line, this.stream.getSourceContext());
                    }

                    if (test !== null && test[1](token)) {
                        if (dropNeedle) {
                            this.stream.next();
                        }

                        if (Object.keys(rv).length === 1) {
                            return rv[0];
                        }

                        return createBaseNode(null, {}, rv, lineno);
                    }

                    if (!this.handlers.has(token.value)) {
                        let e;

                        if (test !== null) {
                            e = new TwingErrorSyntax(
                                `Unexpected "${token.value}" tag`,
                                token.line,
                                this.stream.getSourceContext()
                            );

                            if (Array.isArray(test) && (test.length > 1) && (test[0] instanceof TokenParser)) {
                                e.appendMessage(` (expecting closing tag for the "${test[0].getTag()}" tag defined near line ${lineno}).`);
                            }
                        } else {
                            e = new TwingErrorSyntax(
                                `Unknown "${token.value}" tag.`,
                                token.line,
                                this.stream.getSourceContext()
                            );

                            e.addSuggestions(token.value, this.tags);
                        }

                        throw e;
                    }

                    this.stream.next();

                    let subParser = this.handlers.get(token.value);

                    let node = subParser.parse(token);

                    if (node !== null) {
                        rv[i++] = node;
                    }

                    break;
                case TokenType.COMMENT_START:
                    this.stream.next();
                    token = this.stream.expect(TokenType.TEXT);
                    this.stream.expect(TokenType.COMMENT_END);
                    rv[i++] = createCommentNode(token.value, token.line, token.column);

                    break;
                default:
                    throw new TwingErrorSyntax(
                        'Lexer or parser ended up in unsupported state.',
                        this.getCurrentToken().line,
                        this.stream.getSourceContext()
                    );
            }
        }

        if (Object.keys(rv).length === 1) {
            return rv[0];
        }

        return createBaseNode(null, {}, rv, lineno);
    }

    getBlockStack() {
        return this.blockStack;
    }

    peekBlockStack() {
        return this.blockStack[this.blockStack.length - 1];
    }

    popBlockStack() {
        this.blockStack.pop();
    }

    pushBlockStack(name: string) {
        this.blockStack.push(name);
    }

    hasBlock(name: string) {
        return this.blocks[name] !== undefined;
    }

    getBlock(name: string) {
        return this.blocks[name];
    }

    setBlock(name: string, value: BlockNode) {
        this.blocks[name] = createBodyNode(value, value.line, value.column);
    }

    addTrait(trait: TraitNode) {
        pushToRecord(this.traits, trait);
    }

    hasTraits() {
        return Object.keys(this.traits).length > 0
    }

    embedTemplate(template: ModuleNode) {
        template.attributes.index = this.embeddedTemplateIndex++;

        this.embeddedTemplates.push(template);
    }

    /**
     * @return {Token}
     */
    getCurrentToken(): Token {
        return this.stream.getCurrent();
    }

    /**
     *
     * @return {TwingTokenStream}
     */
    getStream(): TwingTokenStream {
        return this.stream;
    }

    addImportedSymbol(type: string, alias: string, name: string = null, node: BaseNameNode<any> = null) {
        let localScope = this.importedSymbols[0];

        if (!localScope.has(type)) {
            localScope.set(type, new Map());
        }

        let localScopeType = localScope.get(type);

        localScopeType.set(alias, {name, node});
    }

    getImportedSymbol(type: string, alias: string): TwingParserImportedSymbolAlias {
        let result: TwingParserImportedSymbolAlias = null;

        let testImportedSymbol = (importedSymbol: TwingParserImportedSymbol) => {
            if (importedSymbol.has(type)) {
                let importedSymbolType = importedSymbol.get(type);

                if (importedSymbolType.has(alias)) {
                    return importedSymbolType.get(alias);
                }
            }

            return null;
        };

        result = testImportedSymbol(this.importedSymbols[0]);

        // if the symbol does not exist in the current scope (0), try in the main/global scope (last index)
        let length = this.importedSymbols.length;

        if (!result && (length > 1)) {
            result = testImportedSymbol(this.importedSymbols[length - 1]);
        }

        return result;
    }

    hasMacro(name: string) {
        return this.macros[name] !== undefined;
    }

    setMacro(name: string, node: MacroNode) {
        this.macros[name] = node
    }

    isMainScope() {
        return this.importedSymbols.length === 1;
    }

    pushLocalScope() {
        this.importedSymbols.unshift(new Map());
    }

    popLocalScope() {
        this.importedSymbols.shift();
    }

    filterBodyNodes(node: Node, nested: boolean = false): Node | null {
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

            throw new TwingErrorSyntax(
                `A template that extends another one cannot include content outside Twig blocks. Did you forget to put the content inside a {% block %} tag?`,
                node.line,
                this.stream.getSourceContext());
        }

        // bypass nodes that "capture" the output
        if (node.isACaptureNode) {
            // a "block" tag in such a node will serve as a block definition AND be displayed in place as well
            return node;
        }

        // to be removed completely in Twig 3.0
        if (!nested && (node.type === "spaceless")) {
            console.warn(`Using the spaceless tag at the root level of a child template in "${this.stream.getSourceContext().getName()}" at line ${node.line} is deprecated since Twig 2.5.0 and will become a syntax error in Twig 3.0.`);
        }

        // "block" tags that are not captured (see above) are only used for defining
        // the content of the block. In such a case, nesting it does not work as
        // expected as the definition is not part of the default template code flow.
        if (nested && (node.type === "block_reference")) {
            console.warn(`Nesting a block definition under a non-capturing node in "${this.stream.getSourceContext().getName()}" at line ${node.line} is deprecated since Twig 2.5.0 and will become a syntax error in Twig 3.0.`);

            return null;
        }

        if (node.isAnOutputNode && (node.type !== "spaceless")) {
            return null;
        }

        // here, nested means "being at the root level of a child template"
        // we need to discard the wrapping node for the "body" node
        nested = nested || (node.type !== null);

        for (let [k, child] of getChildren(node)) {
            if (child !== null && (this.filterBodyNodes(child, nested) === null)) {
                delete node.children[k];
            }
        }

        return node;
    }

    parseStringExpression(): ExpressionNode {
        let stream = this.getStream();

        let nodes = [];
        // a string cannot be followed by another string in a single expression
        let nextCanBeString = true;
        let token;

        while (true) {
            if (nextCanBeString && (token = stream.nextIf(TokenType.STRING))) {
                nodes.push(createConstantNode(token.value, token.line, token.column));
                nextCanBeString = false;
            } else if (stream.nextIf(TokenType.INTERPOLATION_START)) {
                nodes.push(this.parseExpression());
                stream.expect(TokenType.INTERPOLATION_END);
                nextCanBeString = true;
            } else {
                break;
            }
        }

        let expr = nodes.shift();

        for (let node of nodes) {
            expr = createConcatNode([expr, node], node.line, node.column);
        }

        return expr as any;
    }

    // expressions
    parseExpression(precedence: number = 0, allowArrow: boolean = false): ExpressionNode {
        if (allowArrow) {
            let arrow = this.parseArrow();

            if (arrow) {
                return arrow;
            }
        }

        let expression = this.getPrimary();
        let token = this.getCurrentToken();

        while (this.isBinary(token) && this.binaryOperators.get(token.value).getPrecedence() >= precedence) {
            let operator = this.binaryOperators.get(token.value);

            this.getStream().next();

            if (token.value === 'is not') {
                expression = this.parseNotTestExpression(expression);
            } else if (token.value === 'is') {
                expression = this.parseTestExpression(expression);
            } else {
                const expr1 = this.parseExpression(operator.getAssociativity() === TwingOperatorAssociativity.LEFT ? operator.getPrecedence() + 1 : operator.getPrecedence());
                const expressionFactory = operator.getExpressionFactory();

                expression = expressionFactory([expression, expr1], token.line, token.column);
            }

            token = this.getCurrentToken();
        }

        if (precedence === 0) {
            return this.parseConditionalExpression(expression);
        }

        return expression;
    }

    protected parseArrow(): ArrowFunctionNode | null {
        let stream = this.getStream();
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

            return createArrowFunctionNode(this.parseExpression(0) as any, createBaseNode(null, {}, names), line, column);
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
            token = this.getCurrentToken();

            if (!token.test(TokenType.NAME)) {
                throw new TwingErrorSyntax(`Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}".`, token.line, stream.getSourceContext());
            }

            names[i++] = createAssignNameNode(token.value, token.line, token.column);

            stream.next();

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        stream.expect(TokenType.PUNCTUATION, ')');
        stream.expect(TokenType.ARROW);

        return createArrowFunctionNode(this.parseExpression(0) as any, createBaseNode(null, {}, names), line, column);
    }

    getPrimary(): ExpressionNode {
        let token = this.getCurrentToken();

        if (this.isUnary(token)) {
            let operator = this.unaryOperators.get(token.value);
            this.getStream().next();
            let expr = this.parseExpression(operator.getPrecedence());

            return this.parsePostfixExpression(operator.getExpressionFactory()([expr, null], token.line, token.column));
        } else if (token.test(TokenType.PUNCTUATION, '(')) {
            this.getStream().next();
            let expr = this.parseExpression();
            this.getStream().expect(TokenType.PUNCTUATION, ')', 'An opened parenthesis is not properly closed');

            return this.parsePostfixExpression(expr);
        }

        return this.parsePrimaryExpression();
    }

    parsePrimaryExpression() {
        let token: Token = this.getCurrentToken();
        let node: ExpressionNode;

        switch (token.type) {
            case TokenType.NAME:
                this.getStream().next();

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
                        if ('(' === this.getCurrentToken().value) {
                            node = this.getFunctionNode(token.value, token.line, token.column);
                        } else {
                            node = createNameNode(token.value, token.line, token.column);
                        }
                }
                break;

            case TokenType.NUMBER:
                this.getStream().next();
                node = createConstantNode(token.value, token.line, token.column);
                break;

            case TokenType.STRING:
            case TokenType.INTERPOLATION_START:
                node = this.parseStringExpression();
                break;

            case TokenType.OPERATOR:
                let match = nameRegExp.exec(token.value);

                if (match !== null && match[0] === token.value) {
                    // in this context, string operators are variable names
                    this.getStream().next();
                    node = createNameNode(token.value, token.line, token.column);

                    break;
                } else if (this.unaryOperators.has(token.value)) {
                    let operator = this.unaryOperators.get(token.value);

                    this.getStream().next();

                    let expr = this.parsePrimaryExpression();

                    node = operator.getExpressionFactory()([expr, null], token.line, token.column);
                    break;
                }

            default:
                if (token.test(TokenType.PUNCTUATION, '[')) {
                    node = this.parseArrayExpression();
                } else if (token.test(TokenType.PUNCTUATION, '{')) {
                    node = this.parseHashExpression();
                } else if (token.test(TokenType.OPERATOR, '=') && (this.getStream().look(-1).value === '==' || this.getStream().look(-1).value === '!=')) {
                    throw new TwingErrorSyntax(`Unexpected operator of value "${token.value}". Did you try to use "===" or "!==" for strict comparison? Use "is same as(value)" instead.`, token.line, this.getStream().getSourceContext());
                } else {
                    throw new TwingErrorSyntax(`Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}".`, token.line, this.getStream().getSourceContext());
                }
        }

        return this.parsePostfixExpression(node);
    }

    getFunctionNode(name: string, line: number, column: number): ExpressionNode {
        switch (name) {
            case 'parent':
                this.parseArguments();

                if (!this.getBlockStack().length) {
                    throw new TwingErrorSyntax('Calling "parent" outside a block is forbidden.', line, this.getStream().getSourceContext());
                }

                if (!this.getParent() && !this.hasTraits()) {
                    throw new TwingErrorSyntax('Calling "parent" on a template that does not extend nor "use" another template is forbidden.', line, this.getStream().getSourceContext());
                }

                return createParentNode(this.peekBlockStack(), line, column);
            case 'block':
                let blockArgs = this.parseArguments();

                if (getChildrenCount(blockArgs) < 1) {
                    throw new TwingErrorSyntax('The "block" function takes one argument (the block name).', line, this.getStream().getSourceContext());
                }

                return createBlockReferenceExpressionNode(blockArgs.children[0], getChildrenCount(blockArgs) > 1 ? blockArgs.children[1] : null, line, column);
            case 'attribute':
                let attributeArgs = this.parseArguments();

                if (getChildrenCount(attributeArgs) < 2) {
                    throw new TwingErrorSyntax('The "attribute" function takes at least two arguments (the variable and the attributes).', line, this.getStream().getSourceContext());
                }
                
                return createGetAttributeNode(
                    attributeArgs.children[0],
                    attributeArgs.children[1],
                    getChildrenCount(attributeArgs) > 2 ? attributeArgs.children[2] : createArrayNode({}, line, column),
                    "any",
                    line, column
                );
            default:
                let alias = this.getImportedSymbol('function', name);

                if (alias) {
                    const functionArguments = createArrayNode({}, line, column);
                    const argumentsNode = this.parseArguments();

                    getChildren(argumentsNode).forEach(([, node]) => {
                        functionArguments.addElement(node);
                    });

                    let node = createMethodCallNode(alias.node as any, alias.name, functionArguments, line, column); // todo

                    node.attributes.safe = true;

                    return node;
                }

                let aliasArguments = this.parseArguments(true);

                let aliasFactory = this.getFunctionExpressionFactory(name, line, column);

                return aliasFactory(name, aliasArguments, line, column);
        }
    }

    parseArrayExpression(): ArrayNode {
        const stream = this.getStream();

        stream.expect(TokenType.PUNCTUATION, '[', 'An array element was expected');

        const node = createArrayNode({}, stream.getCurrent().line, stream.getCurrent().column);

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

            node.addElement(this.parseExpression());
        }

        stream.expect(TokenType.PUNCTUATION, ']', 'An opened array is not properly closed');

        return node;
    }

    parseHashExpression(): HashNode {
        let stream = this.getStream();

        stream.expect(TokenType.PUNCTUATION, '{', 'A hash element was expected');

        let node = createHashNode({}, stream.getCurrent().line, stream.getCurrent().column);
        let first = true;

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
            let key;

            if ((token = stream.nextIf(TokenType.STRING)) || (token = stream.nextIf(TokenType.NAME)) || (token = stream.nextIf(TokenType.NUMBER))) {
                key = createConstantNode(token.value, token.line, token.column);
            } else if (stream.test(TokenType.PUNCTUATION, '(')) {
                key = this.parseExpression();
            } else {
                let current = stream.getCurrent();

                throw new TwingErrorSyntax(`A hash key must be a quoted string, a number, a name, or an expression enclosed in parentheses (unexpected token "${typeToEnglish(current.type)}" of value "${current.value}".`, current.line, stream.getSourceContext());
            }

            stream.expect(TokenType.PUNCTUATION, ':', 'A hash key must be followed by a colon (:)');

            let value = this.parseExpression();

            node.addElement(value as any, key as any);
        }

        stream.expect(TokenType.PUNCTUATION, '}', 'An opened hash is not properly closed');

        return node;
    }

    parseSubscriptExpression(node: ExpressionNode) {
        let stream = this.getStream();
        let token = stream.next();
        let lineno = token.line;
        let columnno = token.column;
        let arguments_ = createArrayNode({}, lineno, columnno);
        let arg: ExpressionNode;

        let type: GetAttributeCallType = "any";

        if (token.value === '.') {
            token = stream.next();

            let match = nameRegExp.exec(token.value);

            if ((token.type === TokenType.NAME) || (token.type === TokenType.NUMBER) || (token.type === TokenType.OPERATOR && (match !== null))) {
                arg = createConstantNode(token.value, lineno, columnno);

                if (stream.test(TokenType.PUNCTUATION, '(')) {
                    type = "method";

                    let node = this.parseArguments();

                    getChildren(node).forEach(([, node]) => {
                        arguments_.addElement(node);
                    });
                }
            } else {
                throw new TwingErrorSyntax('Expected name or number.', lineno, stream.getSourceContext());
            }

            if ((node.type === "name") && this.getImportedSymbol('template', node.attributes.name)) {
                let name = arg.attributes.value as string;

                node = createMethodCallNode(node, name, arguments_, lineno, columnno);
                node.attributes.safe = true;

                return node;
            }
        } else {
            type = "array";

            // slice?
            let slice = false;

            if (stream.test(TokenType.PUNCTUATION, ':')) {
                slice = true;
                arg = createConstantNode(0, token.line, token.column) as any;
            } else {
                arg = this.parseExpression();
            }

            if (stream.nextIf(TokenType.PUNCTUATION, ':')) {
                slice = true;
            }

            if (slice) {
                let length: ConstantNode;

                if (stream.test(TokenType.PUNCTUATION, ']')) {
                    length = createConstantNode(null, token.line, token.column);
                } else {
                    length = this.parseExpression() as any;
                }

                let factory = this.getFilterExpressionFactory('slice', token.line, token.column);
                let filterArguments = createArgumentsNode({0: arg, 1: length}, 1, 1);
                let filter = factory(node, 'slice', filterArguments, token.line, token.column);

                stream.expect(TokenType.PUNCTUATION, ']');

                return filter;
            }

            stream.expect(TokenType.PUNCTUATION, ']');
        }

        return createGetAttributeNode(node, arg, arguments_, type, lineno, columnno);
    }

    parsePostfixExpression(node: ExpressionNode): ExpressionNode {
        while (true) {
            let token = this.getCurrentToken();

            if (token.type === TokenType.PUNCTUATION) {
                if ('.' == token.value || '[' == token.value) {
                    node = this.parseSubscriptExpression(node as any);
                } else if ('|' == token.value) {
                    node = this.parseFilterExpression(node);
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        return node;
    }

    parseTestExpression(node: ExpressionNode): ExpressionNode {
        const {line, column} = this.getCurrentToken();

        let stream = this.getStream();
        let name: string;
        let test: TwingTest;

        [name, test] = this.getTest(node.line);

        const expressionFactory = test.getExpressionFactory();

        let testArguments = createArgumentsNode({}, line, column);

        if (stream.test(TokenType.PUNCTUATION, '(')) {
            testArguments = this.parseArguments(true);
        }

        if ((name === 'defined') && (node.type === "name")) {
            let alias = this.getImportedSymbol('function', node.attributes.name);

            if (alias !== null) {
                node = createMethodCallNode(alias.node, alias.name, createArrayNode({}, node.line, node.column), node.line, node.column);
                node.attributes.safe = true;
            }
        }

        return expressionFactory(node, name, testArguments, line, column);
    }

    parseNotTestExpression(node: ExpressionNode): ExpressionNode {
        return createNotNode(this.parseTestExpression(node), this.getCurrentToken().line, this.getCurrentToken().column);
    }

    parseConditionalExpression(expr: ExpressionNode): ExpressionNode {
        let expr2;
        let expr3;

        while (this.getStream().nextIf(TokenType.PUNCTUATION, '?')) {
            if (!this.getStream().nextIf(TokenType.PUNCTUATION, ':')) {
                expr2 = this.parseExpression();

                if (this.getStream().nextIf(TokenType.PUNCTUATION, ':')) {
                    expr3 = this.parseExpression();
                } else {
                    expr3 = createConstantNode('', this.getCurrentToken().line, this.getCurrentToken().column);
                }
            } else {
                expr2 = expr;
                expr3 = this.parseExpression();
            }

            expr = createConditionalNode(expr, expr2, expr3, this.getCurrentToken().line, this.getCurrentToken().column);
        }

        return expr;
    }

    parseFilterExpression(node: ExpressionNode): ExpressionNode {
        this.getStream().next();

        return this.parseFilterExpressionRaw(node);
    }

    parseFilterExpressionRaw(node: ExpressionNode, tag: string = null): ExpressionNode {
        while (true) {
            const token = this.getStream().expect(TokenType.NAME);
            const name: string = token.value;

            let methodArguments;

            if (!this.getStream().test(TokenType.PUNCTUATION, '(')) {
                methodArguments = createBaseNode(null);
            } else {
                methodArguments = this.parseArguments(true, false, true);
            }

            const factory = this.getFilterExpressionFactory(name, token.line, token.column);

            node = factory(node, name, methodArguments, token.line, token.column, tag);

            if (!this.getStream().test(TokenType.PUNCTUATION, '|')) {
                break;
            }

            this.getStream().next();
        }

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
    parseArguments(namedArguments: boolean = false, definition: boolean = false, allowArrow: boolean = false): ArgumentsNode {
        let stream = this.getStream();
        let value: ExpressionNode;
        let token;

        const {line, column} = this.getCurrentToken();
        const argumentsNode = createArgumentsNode({}, line, column);

        stream.expect(TokenType.PUNCTUATION, '(', 'A list of arguments must begin with an opening parenthesis');

        while (!stream.test(TokenType.PUNCTUATION, ')')) {
            if (getRecordSize(argumentsNode.children) > 0) {
                stream.expect(TokenType.PUNCTUATION, ',', 'Arguments must be separated by a comma');
            }

            if (definition) {
                token = stream.expect(TokenType.NAME, null, 'An argument must be a name');

                value = createNameNode(token.value, this.getCurrentToken().line, this.getCurrentToken().column);
            } else {
                value = this.parseExpression(0, allowArrow);
            }

            let name: string | null = null;

            if (namedArguments && (token = stream.nextIf(TokenType.OPERATOR, '='))) {
                if (!value.is("name")) {
                    throw new TwingErrorSyntax(`A parameter name must be a string, "${value.type.toString()}" given.`, token.line, stream.getSourceContext());
                }

                name = value.attributes.name;

                if (definition) {
                    value = this.parsePrimaryExpression();

                    if (!this.checkConstantExpression(value)) {
                        throw new TwingErrorSyntax(`A default value for an argument must be a constant (a boolean, a string, a number, or an array).`, token.line, stream.getSourceContext());
                    }
                } else {
                    value = this.parseExpression(0, allowArrow);
                }
            }

            if (definition) {
                if (name === null) {
                    name = (value as NameNode).attributes.name;
                    value = createConstantNode(null, this.getCurrentToken().line, this.getCurrentToken().column);
                }

                argumentsNode.children[name] = value;
            } else {
                if (name === null) {
                    pushToRecord(argumentsNode.children, value);
                } else {
                    argumentsNode.children[name] = value;
                }
            }
        }

        stream.expect(TokenType.PUNCTUATION, ')', 'A list of arguments must be closed by a parenthesis');

        return argumentsNode;
    }

    parseAssignmentExpression(): Node {
        let stream = this.getStream();
        let targets: Record<string, Node> = {};

        while (true) {
            let token = this.getCurrentToken();

            if (stream.test(TokenType.OPERATOR) && nameRegExp.exec(token.value)) {
                // in this context, string operators are variable names
                this.getStream().next();
            } else {
                stream.expect(TokenType.NAME, null, 'Only variables can be assigned to');
            }

            let value = token.value;

            if (['true', 'false', 'none', 'null'].indexOf(value.toLowerCase()) > -1) {
                throw new TwingErrorSyntax(`You cannot assign a value to "${value}".`, token.line, stream.getSourceContext());
            }

            pushToRecord(targets, createAssignNameNode(value, token.line, token.column));

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        return createBaseNode(null, {}, targets);
    }

    parseMultitargetExpression() {
        let targets: Record<string, Node> = {};

        while (true) {
            pushToRecord(targets, this.parseExpression());

            if (!this.getStream().nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        }

        return createBaseNode(null, {}, targets);
    }

    // checks that the node only contains "constant" elements
    checkConstantExpression(node: Node) {
        if (!(node.type === "expression_constant" || node.type === "array" || node.type === "hash" || node.type === "neg" || node.type === "pos")) {
            return false;
        }

        for (const [, child] of getChildren(node)) {
            if (!this.checkConstantExpression(child)) {
                return false;
            }
        }

        return true;
    }

    private isUnary(token: Token) {
        return token.test(TokenType.OPERATOR) && this.unaryOperators.has(token.value);
    }

    private isBinary(token: Token) {
        return token.test(TokenType.OPERATOR) && this.binaryOperators.has(token.value);
    }

    private getTest(line: number): Array<any> {
        const {strict} = this.options;

        let stream = this.getStream();
        let name = stream.expect(TokenType.NAME).value;

        let test = this.env.getTest(name);

        if (test) {
            return [name, test];
        }

        if (stream.test(TokenType.NAME)) {
            // try 2-words tests
            name = name + ' ' + this.getCurrentToken().value;

            let test = this.env.getTest(name);

            if (test) {
                stream.next();

                return [name, test];
            } else {
                // non-existing two-words test
                if (!strict) {
                    stream.next();

                    return [name, new TwingTest(name, null, [])];
                }
            }
        } else {
            // non-existing one-word test
            if (!strict) {
                return [name, new TwingTest(name, null, [])];
            }
        }

        let e = new TwingErrorSyntax(`Unknown "${name}" test.`, line, stream.getSourceContext());

        e.addSuggestions(name, this.testNames);

        throw e;
    }

    private getFunctionExpressionFactory(name: string, line: number, _column: number) {
        const {strict} = this.options;

        let function_ = this.env.getFunction(name);

        if (function_) {
            if (function_.isDeprecated()) {
                let message = `Twing Function "${function_.getName()}" is deprecated`;

                if (function_.getDeprecatedVersion() !== true) {
                    message += ` since version ${function_.getDeprecatedVersion()}`;
                }

                if (function_.getAlternative()) {
                    message += `. Use "${function_.getAlternative()}" instead`;
                }

                let src = this.getStream().getSourceContext();

                message += ` in "${src.getName()}" at line ${line}.`;

                process.stdout.write(message);
            }

            return function_.getExpressionFactory();
        } else {
            if (strict) {
                let e = new TwingErrorSyntax(`Unknown "${name}" function.`, line, this.getStream().getSourceContext());

                e.addSuggestions(name, this.functionNames);

                throw e;
            }

            return createFunctionNode;
        }
    }

    private getFilterExpressionFactory(name: string, line: number, _column: number) {
        const {strict} = this.options;

        let filter = this.env.getFilter(name);

        if (filter) {
            if (filter.isDeprecated()) {
                let message = `Twing Filter "${filter.getName()}" is deprecated`;

                if (filter.getDeprecatedVersion() !== true) {
                    message += ` since version ${filter.getDeprecatedVersion()}`;
                }

                if (filter.getAlternative()) {
                    message += `. Use "${filter.getAlternative()}" instead`;
                }

                let src = this.getStream().getSourceContext();

                message += ` in "${src.getName()}" at line ${line}.`;

                process.stdout.write(message);
            }

            return filter.getExpressionFactory();
        } else {
            if (strict) {
                let e = new TwingErrorSyntax(`Unknown "${name}" filter.`, line, this.getStream().getSourceContext());

                e.addSuggestions(name, this.filterNames);

                throw e;
            }

            return createFilterNode;
        }
    }
}
