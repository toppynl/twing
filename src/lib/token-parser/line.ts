import {TokenParser} from "../token-parser";
import {Token, TokenType} from "twig-lexer";
import {createLineNode} from "../node/line";

export class TwingTokenParserLine extends TokenParser {
    parse(token: Token) {
        const numberToken = this.parser.getStream().expect(TokenType.NUMBER);

        this.parser.getStream().expect(TokenType.TAG_END);

        return createLineNode(Number(numberToken.value), token.line, token.column, this.getTag());
    }

    getTag() {
        return 'line';
    }
}
