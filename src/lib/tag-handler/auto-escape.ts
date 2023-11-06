import {TwingParsingError} from "../error/parsing";
import {createAutoEscapeNode} from "../node/auto-escape";
import {Token, TokenType} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";
import {EscapingStrategy} from "../environment";

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

                let value: EscapingStrategy;

                if (stream.test(TokenType.TAG_END)) {
                    value = "html";
                } else {
                    const expression = parser.parseExpression(stream);
                    
                    if (!expression.is("constant") ||
                        (typeof expression.attributes.value !== "string" && expression.attributes.value !== false)
                    ) {
                        throw new TwingParsingError('An escaping strategy must be a string or false.', stream.getCurrent().line, stream.getSourceContext());
                    }

                    value = expression.attributes.value;
                }

                stream.expect(TokenType.TAG_END);

                let body = parser.subparse(stream, tag, (token: Token) => {
                    return token.test(TokenType.NAME, 'endautoescape');
                }, true);

                stream.expect(TokenType.TAG_END);

                return createAutoEscapeNode(value, body, line, column, tag);
            };
        }
    };
};
