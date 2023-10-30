import {TokenParser} from "../token-parser";
import {createDoNode} from "../node/do";
import {Token, TokenType} from "twig-lexer";

export class DoTokenParser extends TokenParser {
    parse(token: Token) {
        const expression = this.parser.parseExpression();

        this.parser.getStream().expect(TokenType.TAG_END);

        return createDoNode(expression, token.line, token.column, this.getTag());
    }

    getTag() {
        return 'do';
    }
}
