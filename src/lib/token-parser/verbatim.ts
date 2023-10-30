import {TokenParser} from "../token-parser";
import {createVerbatimNode} from "../node/verbatim";
import {Token, TokenType} from "twig-lexer";

export class VerbatimTokenParser extends TokenParser {
    /**
     * @param {Token} token
     */
    parse(token: Token) {
        let stream = this.parser.getStream();

        stream.expect(TokenType.TAG_END);

        let text = this.parser.subparse([this, this.decideBlockEnd], true);

        stream.expect(TokenType.TAG_END);

        let content = '';

        if (text.type === "text") {
            content = text.attributes.data;
        }

        return createVerbatimNode(content, token.line, token.column, this.getTag());
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endverbatim');
    }

    getTag() {
        return 'verbatim';
    }
}
