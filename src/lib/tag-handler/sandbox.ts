import {createParsingError} from "../error/parsing";
import {createSandboxNode} from "../node/sandbox";
import {getChildren} from "../node";
import {isMadeOfWhitespaceOnly} from "../helpers/is-made-of-whitespace-only";
import {Token, TokenType} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

export const createSandboxTagHandler = (): TwingTagHandler => {
    const tag = 'sandbox';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                stream.expect(TokenType.TAG_END);

                let body = parser.subparse(stream, tag, (token: Token) => {
                    return token.test(TokenType.NAME, 'endsandbox');
                }, true);

                stream.expect(TokenType.TAG_END);

                // in a sandbox tag, only include tags are allowed
                if (!body.is("include")) {
                    for (const [, child] of getChildren(body)) {
                        if (!(child.is("text") && isMadeOfWhitespaceOnly(child.attributes.data))) {
                            if (!child.is("include")) {
                                throw createParsingError('Only "include" tags are allowed within a "sandbox" section.', child.line, child.column, stream.source);
                            }
                        }
                    }
                }

                return createSandboxNode(body, token.line, token.column, tag);
            };
        }
    };
};
