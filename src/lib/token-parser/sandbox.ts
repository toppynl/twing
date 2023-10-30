import {TokenParser} from "../token-parser";
import {TwingErrorSyntax} from "../error/syntax";
import {createSandboxNode} from "../node/sandbox";
import {getChildren} from "../node";
import {isMadeOfWhitespaceOnly} from "../helpers/is-made-of-whitespace-only";
import {Token, TokenType} from "twig-lexer";

export class TwingTokenParserSandbox extends TokenParser {
    parse(token: Token) {
        let stream = this.parser.getStream();

        stream.expect(TokenType.TAG_END);

        let body = this.parser.subparse([this, this.decideBlockEnd], true);

        stream.expect(TokenType.TAG_END);

        // in a sandbox tag, only include tags are allowed
        if (!body.is("include")) {
            for (const [, child] of getChildren(body)) {
                if (!(child.is("text") && isMadeOfWhitespaceOnly(child.attributes.data))) {
                    if (!child.is("include")) {
                        throw new TwingErrorSyntax('Only "include" tags are allowed within a "sandbox" section.', child.line, stream.getSourceContext());
                    }
                }
            }
        }

        return createSandboxNode(body, token.line, token.column, this.getTag());
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endsandbox');
    }

    getTag() {
        return 'sandbox';
    }
}
