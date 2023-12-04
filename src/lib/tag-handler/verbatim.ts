import {createVerbatimNode} from "../node/output/verbatim";
import {Token} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";
import {TwingNode} from "../node";

export const createVerbatimTagHandler = (): TwingTagHandler => {
    const tag = 'verbatim';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                stream.expect("TAG_END");

                const text = parser.subparse(stream, tag, (token: Token) => {
                    return token.test("NAME", 'endverbatim');
                }) as TwingNode;

                stream.next();
                stream.expect("TAG_END");

                let content = '';

                if (text.type === "text") {
                    content = text.attributes.data;
                }

                return createVerbatimNode(content, token.line, token.column, tag);
            };
        }
    };
};
