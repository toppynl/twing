import {TwingTokenParserInclude} from "./include";
import {createEmbedNode} from "../node/include/embed";
import {Token, TokenType} from "twig-lexer";

export class TwingTokenParserEmbed extends TwingTokenParserInclude {
    parse(token: Token) {
        const {line, column} = token;

        let stream = this.parser.getStream();

        let parent = this.parser.parseExpression();

        let embedArguments = this.parseArguments(line, column);

        let variables = embedArguments.variables;
        let only = embedArguments.only;
        let ignoreMissing = embedArguments.ignoreMissing;

        let parentToken;
        let fakeParentToken;

        parentToken = fakeParentToken = new Token(TokenType.STRING, '__parent__', token.line, token.column);

        if (parent.type === "expression_constant") {
            parentToken = new Token(TokenType.STRING, parent.attributes.value, token.line, token.column);
        } else if (parent.type === "name") {
            parentToken = new Token(TokenType.NAME, parent.attributes.name, token.line, token.column);
        }

        // inject a fake parent to make the parent() function work
        stream.injectTokens([
            new Token(TokenType.TAG_START, '', token.line, token.column),
            new Token(TokenType.NAME, 'extends', token.line, token.column),
            parentToken,
            new Token(TokenType.TAG_END, '', token.line, token.column),
        ]);

        let module = this.parser.parse(stream, [this, this.decideBlockEnd], true);

        // override the parent with the correct one
        if (fakeParentToken === parentToken) {
            module.children.parent = parent;
        }

        this.parser.embedTemplate(module);

        stream.expect(TokenType.TAG_END);

        const {templateName, index} = module.attributes;

        return createEmbedNode({
            templateName,
            index,
            only,
            ignoreMissing
        }, {
            variables
        }, token.line, token.column, this.getTag());
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endembed');
    }

    getTag() {
        return 'embed';
    }
}
