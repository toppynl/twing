import {createParsingError} from "../error/parsing";
import {createSandboxNode} from "../node/sandbox";
import {getChildren} from "../node";
import {isMadeOfWhitespaceOnly} from "../helpers/is-made-of-whitespace-only";
import {Token} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";
import {includeNodeType} from "../node/include/include";

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
                if (!body.is(includeNodeType)) {
                    for (const [, child] of getChildren(body)) {
                        if (!(child.is("text") && isMadeOfWhitespaceOnly(child.attributes.data))) {
                            if (!child.is(includeNodeType)) {
                                throw createParsingError('Only "include" tags are allowed within a "sandbox" section.', child, stream.source.name);
                            }
                        }
                    }
                }

                return createSandboxNode(body, token.line, token.column, tag);
            };
        }
    };
};
