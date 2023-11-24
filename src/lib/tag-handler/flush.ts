import {createFlushNode} from "../node/flush";
import {TwingTagHandler} from "../tag-handler";

export const createFlushTagHandler = (): TwingTagHandler => {
    const tag = 'flush';

    return {
        tag,
        initialize: () => {
            return (token, stream) => {
                stream.expect("TAG_END");

                return createFlushNode(token.line, token.column, tag);
            };
        }
    };
};
