import {TokenParser} from "../token-parser";
import {createDeprecatedNode} from "../node/deprecated";
import {Token, TokenType} from "twig-lexer";

/**
 * Deprecates a section of a template.
 *
 * <pre>
 * {% deprecated 'The "base.twig" template is deprecated, use "layout.twig" instead.' %}
 *
 * {% extends 'layout.html.twig' %}
 * </pre>
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export class TwingTokenParserDeprecated extends TokenParser {
    parse(token: Token) {
        const expression = this.parser.parseExpression();

        this.parser.getStream().expect(TokenType.TAG_END);

        return createDeprecatedNode(expression, token.line, token.column, this.getTag());
    }

    getTag() {
        return 'deprecated';
    }
}
