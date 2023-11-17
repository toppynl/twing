import {createSpacelessNode} from "../node/output/spaceless";
import {Token, TokenType} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

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
export const createSpacelessTagHandler = (): TwingTagHandler => {
    const tag = 'spaceless';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;

                console.warn(`The "spaceless" tag in "${stream.source.name}" at line ${line} is deprecated since Twig 2.7, use the "spaceless" filter instead.`);

                stream.expect(TokenType.TAG_END);

                const body = parser.subparse(stream, tag, (token: Token) => {
                    return token.test(TokenType.NAME, 'endspaceless');
                }, true);

                stream.expect(TokenType.TAG_END);

                return createSpacelessNode(body, line, column, tag);
            };
        }
    };
};
