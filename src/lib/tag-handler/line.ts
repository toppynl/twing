import {TokenType} from "twig-lexer";
import {createLineNode} from "../node/line";
import {TwingTagHandler} from "../tag-handler";

export const createLineTagHandler = (): TwingTagHandler => {
    const tag = 'line';

    return {
        tag,
        initialize: () => {
            return (token, stream) => {
                const numberToken = stream.expect(TokenType.NUMBER);

                stream.expect(TokenType.TAG_END);

                return createLineNode(Number(numberToken.value), token.line, token.column, tag);
            };
        }
    };
};
