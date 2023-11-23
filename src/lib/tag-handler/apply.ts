import {TokenType} from "twig-lexer";
import type {TwingTagHandler} from "../tag-handler";
import {createApplyNode} from "../node/apply";
import {createArrayNode} from "../node/expression/array";
import {createConstantNode} from "../node/expression/constant";

export const createApplyTagHandler = (): TwingTagHandler => {
    const tag = 'apply';

    const tokenHandler: TwingTagHandler = {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;
                
                const filterDefinitions = parser.parseFilterDefinitions(stream);

                stream.expect(TokenType.TAG_END);

                let body = parser.subparse(stream, tag, (token): boolean => {
                    return token.test(TokenType.NAME, 'endapply');
                }, true);

                stream.expect(TokenType.TAG_END);
                
                return createApplyNode(createArrayNode(filterDefinitions.map(({name, arguments: filterArgument}) => {
                    return {
                        key: createConstantNode(name, line, column),
                        value: filterArgument
                    }
                }), line, column), body, line, column);
            };
        }
    }

    return tokenHandler;
};
