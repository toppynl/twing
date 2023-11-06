import {createWithNode} from "../node/with";
import {Token, TokenType} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

export const createWithTagHandler = (): TwingTagHandler => {
    const tag = 'with';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                let variables = null;
                let only = false;

                if (!stream.test(TokenType.TAG_END)) {
                    variables = parser.parseExpression(stream);

                    only = stream.nextIf(TokenType.NAME, 'only') !== null;
                }

                stream.expect(TokenType.TAG_END);

                let body = parser.subparse(stream, tag, (token: Token) => {
                    return token.test(TokenType.NAME, 'endwith');
                }, true);

                stream.expect(TokenType.TAG_END);

                return createWithNode(body, variables, only, token.line, token.column, tag);
            };
        }
    };
};
