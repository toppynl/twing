import {createDoNode} from "../node/do";
import {TwingTagHandler} from "../tag-handler";

export const createDoTagHandler = (): TwingTagHandler => {
    const tag = 'do';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const expression = parser.parseExpression(stream);

                stream.expect("TAG_END");

                return createDoNode(expression, token.line, token.column, tag);
            };
        }
    };
};
