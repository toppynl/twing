import {TokenParser} from "../token-parser";
import {createBlockReferenceExpressionNode} from "../node/expression/block-reference";
import {createConstantNode} from "../node/expression/constant";
import {createBlockNode} from "../node/block";
import {createPrintNode} from "../node/print";
import {Token, TokenType} from "twig-lexer";

/**
 * Filters a section of a template by applying filters.
 *
 * <pre>
 * {% filter upper %}
 *  This text becomes uppercase
 * {% endfilter %}
 * </pre>
 */
export class TwingTokenParserFilter extends TokenParser {
    parse(token: Token) {
        let stream = this.parser.getStream();
        let line = token.line;
        let column = token.column;

        console.warn(`The "filter" tag in "${stream.getSourceContext().getName()}" at line ${line} is deprecated since Twig 2.9, use the "apply" tag instead.`);

        let name = this.parser.getVarName();
        let ref = createBlockReferenceExpressionNode(createConstantNode(name, line, column), null, line, column, this.getTag());
        let filter = this.parser.parseFilterExpressionRaw(ref, this.getTag());

        stream.expect(TokenType.TAG_END);

        let body = this.parser.subparse([this, this.decideBlockEnd], true);

        stream.expect(TokenType.TAG_END);

        let block = createBlockNode(name, body as any, line, column); // todo

        this.parser.setBlock(name, block as any); // todo

        return createPrintNode(filter, line, column, this.getTag());
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endfilter');
    }

    getTag() {
        return 'filter';
    }
}
