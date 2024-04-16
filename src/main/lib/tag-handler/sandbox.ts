import {createParsingError} from "../error/parsing";
import {createSandboxNode} from "../node/sandbox";
import {getChildren, TwingNode} from "../node";
import {isMadeOfWhitespaceOnly} from "../helpers/is-made-of-whitespace-only";
import {Token} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

export const createSandboxTagHandler = (): TwingTagHandler => {
    const tag = 'sandbox';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                stream.expect("TAG_END");

                let body = parser.subparse(stream, tag, (token: Token) => {
                    return token.test("NAME", 'endsandbox');
                });

                stream.next();
                stream.expect("TAG_END");

                // in a sandbox tag, only include tags are allowed
                if (body.type !== "include" && body.type !== "embed") {
                    for (const keyAndChild of getChildren(body)) {
                        const child = keyAndChild[1] as TwingNode; 
                        
                        if (!(child.type === "text" && isMadeOfWhitespaceOnly(child.attributes.data))) {
                            if (child.type !== "include" && child.type !== "embed") {
                                throw createParsingError('Only "include" tags are allowed within a "sandbox" section.', child, stream.source);
                            }
                        }
                    }
                }

                return createSandboxNode(body, token.line, token.column, tag);
            };
        }
    };
};
