import {createFlushNode} from "../node/flush";
import {TokenType} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

export const createFlushTagHandler = (): TwingTagHandler => {
    const tag = 'flush';

    return {
        tag,
        initialize: () => {
            return (token, stream) => {
                stream.expect(TokenType.TAG_END);

                return createFlushNode(token.line, token.column, tag);
            };
        }
    };
};
