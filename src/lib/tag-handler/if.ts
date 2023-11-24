import {createBaseNode} from "../node";
import {createIfNode} from "../node/if";
import {Token} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

/**
 * Tests a condition.
 *
 * <pre>
 * {% if users %}
 *  <ul>
 *    {% for user in users %}
 *      <li>{{ user.username|e }}</li>
 *    {% endfor %}
 *  </ul>
 * {% endif %}
 * </pre>
 */
export const createIfTagHandler = (): TwingTagHandler => {
    const tag = 'if';

    const decideIfFork = (token: Token) => {
        return token.test("NAME", ['elseif', 'else', 'endif']);
    };

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;

                let expression = parser.parseExpression(stream);

                stream.expect("TAG_END");

                let index = 0;
                let body = parser.subparse(stream, tag, decideIfFork);

                const tests = {
                    [index++]: expression,
                    [index++]: body
                };

                let elseNode = null;

                let end = stream.isEOF();

                while (!end) {
                    switch (stream.next().value) {
                        case 'else':
                            stream.expect("TAG_END");
                            elseNode = parser.subparse(stream, tag, (token) => {
                                return token.test("NAME", 'endif');
                            });
                            break;

                        case 'elseif':
                            expression = parser.parseExpression(stream);
                            stream.expect("TAG_END");
                            body = parser.subparse(stream, tag, decideIfFork);
                            tests[index++] = expression;
                            tests[index++] = body;
                            break;

                        case 'endif':
                            end = true;
                            break;
                    }
                }

                stream.expect("TAG_END");

                return createIfNode(createBaseNode(null, {}, tests), elseNode, line, column, tag);
            };
        }
    };
};
