import {createTypesNode} from "../node/types";
import {TwingTagHandler} from "../tag-handler";

export const createTypesTagHandler = (): TwingTagHandler => {
    const tag = 'types';

    return {
        tag,
        initialize: () => {
            return (token, stream) => {
                while (!stream.test("TAG_END") && !stream.isEOF()) {
                    stream.next();
                }

                stream.expect("TAG_END");

                return createTypesNode(token.line, token.column, tag);
            };
        }
    };
};
