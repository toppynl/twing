import {TokenParser} from "../token-parser";
import {TwingErrorSyntax} from "../error/syntax";
import {ConstantNode, createConstantNode} from "../node/expression/constant";
import {createBaseNode} from "../node";
import {Token, TokenType} from "twig-lexer";
import {createTraitNode} from "../node/trait";

export class UseTokenParser extends TokenParser {
    parse(token: Token) {
        let template = this.parser.parseExpression();
        let stream = this.parser.getStream();

        if (template.type !== "expression_constant") {
            throw new TwingErrorSyntax('The template references in a "use" statement must be a string.', stream.getCurrent().line, stream.getSourceContext());
        }

        let targets: Record<string, ConstantNode> = {};

        if (stream.nextIf(TokenType.NAME, 'with')) {
            do {
                let name = stream.expect(TokenType.NAME).value;
                let alias = name;

                if (stream.nextIf(TokenType.NAME, 'as')) {
                    alias = stream.expect(TokenType.NAME).value;
                }

                targets[name] = createConstantNode(alias, token.line, token.column);

                if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                    break;
                }
            } while (true);
        }

        stream.expect(TokenType.TAG_END);

        this.parser.addTrait(createTraitNode(template, createBaseNode(null, {}, targets), token.line, token.column));

        return createBaseNode(null);
    }

    getTag() {
        return 'use';
    }
}
