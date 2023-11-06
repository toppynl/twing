import {createBaseNode} from "../node";
import {TwingParsingError} from "../error/parsing";
import {createBlockNode} from "../node/block";
import {createPrintNode} from "../node/print";
import {createBlockReferenceNode} from "../node/block-reference";
import {Token, TokenType} from "twig-lexer";
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
                const name = stream.expect(TokenType.NAME).value;

                if (parser.hasBlock(name)) {
                    throw new TwingParsingError(`The block '${name}' has already been defined line ${parser.getBlock(name)!.line}.`, line, stream.getSourceContext());
                }

                const block = createBlockNode(name, createBaseNode(null), line, column);

                parser.setBlock(name, block);
                parser.pushLocalScope();
                parser.pushBlockStack(name);

                let body;

                if (stream.nextIf(TokenType.TAG_END)) {
                    body = parser.subparse(stream, tag, (token: Token) => {
                        return token.test(TokenType.NAME, 'endblock');
                    }, true);

                    const token = stream.nextIf(TokenType.NAME);

                    if (token) {
                        const value = token.value;

                        if (value !== name) {
                            throw new TwingParsingError(`Expected endblock for block "${name}" (but "${value}" given).`, stream.getCurrent().line, stream.getSourceContext());
                        }
                    }
                } else {
                    body = createBaseNode(null, {}, {
                        0: createPrintNode(parser.parseExpression(stream), line, column)
                    });
                }

                stream.expect(TokenType.TAG_END);

                block.children.body = body;

                parser.popBlockStack();
                parser.popLocalScope();

                return createBlockReferenceNode(name, line, column, tag);
            };
        }
    };
};
