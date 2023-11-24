import {createBlockFunctionNode} from "../node/expression/block-function";
import {createConstantNode} from "../node/expression/constant";
import {createBlockNode} from "../node/block";
import {createPrintNode} from "../node/output/print";
import {Token} from "twig-lexer";
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

                console.warn(`The "filter" tag in "${stream.source.name}" at line ${line} is deprecated since Twig 2.9, use the "apply" tag instead.`);

                const name = parser.getVarName();
                const blockFunctionNode = createBlockFunctionNode(createConstantNode(name, line, column), null, line, column, tag);
                
                const filterNode = parser.parseFilterExpressionRaw(stream, blockFunctionNode, tag);
                
                stream.expect("TAG_END");

                const body = parser.subparse(stream, tag, (token: Token) => {
                    return token.test("NAME", 'endfilter');
                });

                stream.next();
                stream.expect("TAG_END");

                const block = createBlockNode(name, body, line, column);

                parser.setBlock(name, block);

                return createPrintNode(filterNode, line, column);
            };
        }
    };
};
