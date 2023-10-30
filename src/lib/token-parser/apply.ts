import {TokenParser} from "../token-parser";
import {createBaseNode} from "../node";
import {createPrintNode} from "../node/print";
import {createTemporaryNameNode} from "../node/expression/temp-name";
import {Token, TokenType} from "twig-lexer";
import {createSetNode} from "../node/set";
import {ExpressionNode} from "../node/expression";

/**
 * Applies filters on a section of a template.
 *
 *   {% apply upper %}
 *      This text becomes uppercase
 *   {% endapply %}
 */
export class TwingTokenParserApply extends TokenParser {
    parse(token: Token) {
        let lineno = token.line;
        let columno = token.column;
        let name = this.parser.getVarName();

        let reference = createTemporaryNameNode(name, false, lineno, columno);

        // reference._attributes.always_defined = true; // todo: was there, useful?

        let filter = this.parser.parseFilterExpressionRaw(reference, this.getTag()) as ExpressionNode; // todo

        this.parser.getStream().expect(TokenType.TAG_END);

        let body = this.parser.subparse([this, this.decideBlockEnd], true);

        this.parser.getStream().expect(TokenType.TAG_END);

        reference = createTemporaryNameNode(name, true, lineno, columno);

        return createBaseNode(null, {}, {
            0: createSetNode(true, reference, body, lineno, columno, this.getTag()),
            1: createPrintNode(filter, lineno, columno, this.getTag())
        });
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endapply');
    }

    getTag() {
        return 'apply';
    }
}
