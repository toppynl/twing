import {TwingParsingError} from "../error/parsing";
import {createAutoEscapeNode} from "../node/auto-escape";
import {Token, TokenType} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

/**
 * Marks a section of a template to be escaped or not.
 */
export const createAutoEscapeTagHandler = (): TwingTagHandler => {
    const tag = 'autoescape';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;

                let strategy: string | true | null;

                if (stream.test(TokenType.TAG_END)) {
                    strategy = true; // defer to the default strategy
                } else {
                    const expression = parser.parseExpression(stream);

                    if (!expression.is("constant") ||
                        (typeof expression.attributes.value !== "string" && expression.attributes.value !== false)
                    ) {
                        const {line, column} = expression;

                        throw new TwingParsingError('An escaping strategy must be a string or false.', line, column, stream.source);
                    }

                    const {value} = expression.attributes;

                    strategy = value === false ? null : value; // null means no auto-escaping
                }

                stream.expect(TokenType.TAG_END);

                let body = parser.subparse(stream, tag, (token: Token) => {
                    return token.test(TokenType.NAME, 'endautoescape');
                }, true);

                stream.expect(TokenType.TAG_END);

                return createAutoEscapeNode(strategy, body, line, column, tag);
            };
        }
    };
};
