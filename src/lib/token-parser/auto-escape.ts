/**
 * Marks a section of a template to be escaped or not.
 */
import {TokenParser} from "../token-parser";
import {Node} from "../node";
import {TwingErrorSyntax} from "../error/syntax";
import {createAutoEscapeNode} from "../node/auto-escape";
import {Token, TokenType} from "twig-lexer";

export class AutoEscapeTokenParser extends TokenParser {
    parse(token: Token): Node {
        let lineno = token.line;
        let columnno = token.column;
        let stream = this.parser.getStream();
        let value: string | false;

        if (stream.test(TokenType.TAG_END)) {
            value = 'html';
        }
        else {
            let expr = this.parser.parseExpression();

            if (expr.type !== "expression_constant") {
                throw new TwingErrorSyntax('An escaping strategy must be a string or false.', stream.getCurrent().line, stream.getSourceContext());
            }

            value = expr.attributes.value as string | false;
        }

        stream.expect(TokenType.TAG_END);

        let body = this.parser.subparse([this, this.decideBlockEnd], true);

        stream.expect(TokenType.TAG_END);

        return createAutoEscapeNode(value, body, lineno, columnno, this.getTag());
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endautoescape');
    }

    getTag() {
        return 'autoescape';
    }
}
