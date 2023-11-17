import {createBaseNode} from "../node";
import {createPrintNode} from "../node/output/print";
import {createTemporaryNameNode} from "../node/expression/temporary-name";
import {TokenType} from "twig-lexer";
import {createSetNode} from "../node/set";
import type {TwingTagHandler} from "../tag-handler";

export const createApplyTagHandler = (): TwingTagHandler => {
    const tag = 'apply';

    const tokenHandler: TwingTagHandler = {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;
                const name = parser.getVarName();

                let reference = createTemporaryNameNode(name, false, line, column);
                
                const filter = parser.parseFilterExpressionRaw(stream, reference, tag);

                stream.expect(TokenType.TAG_END);

                let body = parser.subparse(stream, tag, (token): boolean => {
                    return token.test(TokenType.NAME, 'endapply');
                }, true);

                stream.expect(TokenType.TAG_END);

                reference = createTemporaryNameNode(name, true, line, column);

                return createBaseNode(null, {}, {
                    0: createSetNode(true, reference, body, line, column, tag),
                    1: createPrintNode(filter, line, column)
                });
            };
        }
    }

    return tokenHandler;
};
