import {createIncludeNode} from "../node/include/include";
import {TwingBaseExpressionNode} from "../node/expression";
import {createArrayNode} from "../node/expression/array";
import {TwingTagHandler} from "../tag-handler";
import {TwingParser} from "../parser";
import {TwingTokenStream} from "../token-stream";

export const createIncludeTagHandler = (): TwingTagHandler => {
    const tag = 'include';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;
                const expression = parser.parseExpression(stream);
                const {ignoreMissing, only, variables} = parseArguments(parser, stream, line, column);

                return createIncludeNode({
                    only,
                    ignoreMissing
                }, {
                    expression,
                    variables
                }, token.line, token.column, tag);
            };
        }
    };
};

export const parseArguments = (
    parser: TwingParser,
    stream: TwingTokenStream,
    line: number,
    column: number
): { 
    variables: TwingBaseExpressionNode; 
    only: boolean; 
    ignoreMissing: boolean;
} => {
    let ignoreMissing = false;

    if (stream.nextIf("NAME", 'ignore')) {
        stream.expect("NAME", 'missing');

        ignoreMissing = true;
    }

    let variables: TwingBaseExpressionNode = createArrayNode([], line, column);

    if (stream.nextIf("NAME", 'with')) {
        variables = parser.parseExpression(stream);
    }

    let only = false;

    if (stream.nextIf("NAME", 'only')) {
        only = true;
    }

    stream.expect("TAG_END");

    return {
        variables,
        only,
        ignoreMissing
    };
};
