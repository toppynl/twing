/**
 * Loops over each item of a sequence.
 *
 * <pre>
 * <ul>
 *  {% for user in users %}
 *    <li>{{ user.username|e }}</li>
 *  {% endfor %}
 * </ul>
 * </pre>
 */
import {TwingParsingError} from "../error/parsing";
import {TokenType} from "twig-lexer";
import type {TwingTagHandler} from "../tag-handler";

export const createExtendsTagHandler = (): TwingTagHandler => {
    const tag = 'extends';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line} = token;
                
                if (parser.peekBlockStack()) {
                    throw new TwingParsingError('Cannot use "extend" in a block.', line, stream.getSourceContext());
                } else if (!parser.isMainScope()) {
                    throw new TwingParsingError('Cannot use "extend" in a macro.', line, stream.getSourceContext());
                }

                if (parser.parent !== null) {
                    throw new TwingParsingError('Multiple extends tags are forbidden.', line, stream.getSourceContext());
                }
                
                parser.parent = parser.parseExpression(stream);

                stream.expect(TokenType.TAG_END);

                return null;
            };
        }
    };
};
