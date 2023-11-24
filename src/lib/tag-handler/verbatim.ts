import {createVerbatimNode} from "../node/output/verbatim";
import {Token} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

export const createVerbatimTagHandler = (): TwingTagHandler => {
    const tag = 'verbatim';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                stream.expect("TAG_END");

                let text = parser.subparse(stream, tag, (token: Token) => {
                    return token.test("NAME", 'endverbatim');
                });

                stream.next();
                stream.expect("TAG_END");

                let content = '';

                if (text.is("text")) {
                    content = text.attributes.data;
                }

                return createVerbatimNode(content, token.line, token.column, tag);
            };
        }
    };
};
