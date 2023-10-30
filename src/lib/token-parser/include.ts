import {TokenParser} from "../token-parser";
import {createIncludeNode} from "../node/include/include";
import {ExpressionNode} from "../node/expression";
import {Token, TokenType} from "twig-lexer";
import {Node} from "../node";
import {createArrayNode} from "../node/expression/array";

export class TwingTokenParserInclude extends TokenParser {
    parse(token: Token): Node {
        const {line, column} = token;
        const expression = this.parser.parseExpression();
        const {ignoreMissing, only, variables} = this.parseArguments(line, column);

        return createIncludeNode({
            only,
            ignoreMissing
        }, {
            expression,
            variables
        }, token.line, token.column, this.getTag());
    }

    getTag() {
        return 'include';
    }

    protected parseArguments(line: number, column: number): { variables: ExpressionNode; only: boolean; ignoreMissing: boolean } {
        let stream = this.parser.getStream();

        let ignoreMissing = false;

        if (stream.nextIf(TokenType.NAME, 'ignore')) {
            stream.expect(TokenType.NAME, 'missing');

            ignoreMissing = true;
        }

        let variables: ExpressionNode = createArrayNode({}, line, column);

        if (stream.nextIf(TokenType.NAME, 'with')) {
            variables = this.parser.parseExpression();
        }

        let only = false;

        if (stream.nextIf(TokenType.NAME, 'only')) {
            only = true;
        }

        stream.expect(TokenType.TAG_END);

        return {
            variables,
            only: only,
            ignoreMissing: ignoreMissing
        };
    }
}
