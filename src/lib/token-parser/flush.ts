import {TokenParser} from "../token-parser";
import {createFlushNode} from "../node/flush";
import {Token, TokenType} from "twig-lexer";

export class TwingTokenParserFlush extends TokenParser {
    parse(token: Token) {
        this.parser.getStream().expect(TokenType.TAG_END);

        return createFlushNode(token.line, token.column, this.getTag());
    }

    getTag() {
        return 'flush';
    }
}
