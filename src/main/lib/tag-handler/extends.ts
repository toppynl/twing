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
import {createParsingError} from "../error/parsing";
import type {TwingTagHandler} from "../tag-handler";

export const createExtendsTagHandler = (): TwingTagHandler => {
    const tag = 'extends';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;

                if (parser.peekBlockStack()) {
                    throw createParsingError('Cannot use "extend" in a block.', {line, column}, stream.source);
                } else if (!parser.isMainScope()) {
                    throw createParsingError('Cannot use "extend" in a macro.', {line, column}, stream.source);
                }

                if (parser.parent !== null) {
                    throw createParsingError('Multiple extends tags are forbidden.', {line, column}, stream.source);
                }

                parser.parent = parser.parseExpression(stream);

                stream.expect("TAG_END");

                return null;
            };
        }
    };
};
