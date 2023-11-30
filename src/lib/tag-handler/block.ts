import {createBaseNode} from "../node";
import {createParsingError} from "../error/parsing";
import {createBlockNode} from "../node/block";
import {createPrintNode} from "../node/output/print";
import {createBlockReferenceNode} from "../node/output/block-reference";
import {Token} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

/**
 * Marks a section of a template as being reusable.
 *
 * <pre>
 *  {% block head %}
 *    <link rel="stylesheet" href="style.css" />
 *    <title>{% block title %}{% endblock %} - My Webpage</title>
 *  {% endblock %}
 * </pre>
 */
export const createBlockTagHandler = (): TwingTagHandler => {
    const tag = 'block';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;
                const name = stream.expect("NAME").value;

                let block = parser.getBlock(name);

                if (block !== null) {
                    throw createParsingError(`The block '${name}' has already been defined at {${block.line}:${block.column}}.`, {line, column}, stream.source.name);
                }

                block = createBlockNode(name, createBaseNode(null), line, column);

                parser.setBlock(name, block);
                parser.pushLocalScope();
                parser.pushBlockStack(name);

                let body;

                if (stream.nextIf("TAG_END")) {
                    body = parser.subparse(stream, tag, (token: Token) => {
                        return token.test("NAME", 'endblock');
                    });

                    stream.next();
                    
                    const token = stream.nextIf("NAME");

                    if (token) {
                        const value = token.value;

                        if (value !== name) {
                            const {line, column} = token;

                            throw createParsingError(`Expected endblock for block "${name}" (but "${value}" given).`, {line, column}, stream.source.name);
                        }
                    }
                } else {
                    body = createBaseNode(null, {}, {
                        0: createPrintNode(parser.parseExpression(stream), line, column)
                    });
                }

                stream.expect("TAG_END");

                block.children.body = body;

                parser.popBlockStack();
                parser.popLocalScope();

                return createBlockReferenceNode(name, line, column, tag);
            };
        }
    };
};
