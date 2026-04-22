import type {TwingTagHandler} from "@toppynl/twing";
import {Token} from "twig-lexer";
import {createCacheNode} from "../node/cache";

export const createCacheTagHandler = (): TwingTagHandler => {
    const tag = "cache";

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const key = parser.parseExpression(stream);

                let ttl = null;

                if (stream.nextIf("NAME", "ttl")) {
                    stream.expect("PUNCTUATION", "(");
                    ttl = parser.parseExpression(stream);
                    stream.expect("PUNCTUATION", ")");
                }

                stream.expect("TAG_END");

                const body = parser.subparse(stream, tag, (t: Token) => t.test("NAME", "endcache"));

                stream.next();
                stream.expect("TAG_END");

                return createCacheNode(key, ttl, body, token.line, token.column, tag);
            };
        }
    };
};
