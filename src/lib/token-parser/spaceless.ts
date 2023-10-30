/**
 * Loops over each item of a sequence.
 *
 * <pre>
 * <ul>
 *  {% for user in users %}
 *    <li>{{ user.username|e }}</li>
 *  {% endfor %}
 * </ul>
 * </pre>
 */
import {TokenParser} from "../token-parser";
import {createSpacelessNode} from "../node/spaceless";
import {Token, TokenType} from "twig-lexer";

export class TwingTokenParserSpaceless extends TokenParser {
    parse(token: Token) {
        const {line, column} = token;
        const stream = this.parser.getStream();

        console.warn(`The "spaceless" tag in "${stream.getSourceContext().getName()}" at line ${line} is deprecated since Twig 2.7, use the "spaceless" filter instead.`);

        stream.expect(TokenType.TAG_END);

        const body = this.parser.subparse([this, this.decideSpacelessEnd], true);

        stream.expect(TokenType.TAG_END);

        return createSpacelessNode(body, line, column, this.getTag());
    }

    decideSpacelessEnd(token: Token) {
        return token.test(TokenType.NAME, 'endspaceless');
    }

    getTag() {
        return 'spaceless';
    }
}
