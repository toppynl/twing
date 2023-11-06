import {createBlockReferenceExpressionNode} from "../node/expression/block-reference";
import {createConstantNode} from "../node/expression/constant";
import {createBlockNode} from "../node/block";
import {createPrintNode} from "../node/print";
import {Token, TokenType} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

/**
 * Filters a section of a template by applying filters.
 *
 * <pre>
 * {% filter upper %}
 *  This text becomes uppercase
 * {% endfilter %}
 * </pre>
 */
export const createFilterTagHandler = (): TwingTagHandler => {
    const tag = 'filter';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                let line = token.line;
                let column = token.column;

                console.warn(`The "filter" tag in "${stream.getSourceContext().name}" at line ${line} is deprecated since Twig 2.9, use the "apply" tag instead.`);

                let name = parser.getVarName();
                let ref = createBlockReferenceExpressionNode(createConstantNode(name, line, column), null, line, column, tag);
                let filter = parser.parseFilterExpressionRaw(stream, ref, tag);

                stream.expect(TokenType.TAG_END);

                let body = parser.subparse(stream, tag, (token: Token) => {
                    return token.test(TokenType.NAME, 'endfilter');
                }, true);

                stream.expect(TokenType.TAG_END);

                let block = createBlockNode(name, body as any, line, column); // todo

                parser.setBlock(name, block);

                return createPrintNode(filter, line, column);
            };
        }
    };
};
