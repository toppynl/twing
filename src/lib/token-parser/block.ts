import {TokenParser} from "../token-parser";
import {createBaseNode, Node} from "../node";
import {TwingErrorSyntax} from "../error/syntax";

import {createBlockNode} from "../node/block";
import {createPrintNode} from "../node/print";
import {createBlockReferenceNode} from "../node/block-reference";
import {Token, TokenType} from "twig-lexer";

/**
 * Marks a section of a template as being reusable.
 *
 * <pre>
 *  {% block head %}
 *    <link rel="stylesheet" href="style.css" />
 *    <title>{% block title %}{% endblock %} - My Webpage</title>
 *  {% endblock %}
 * </pre>
 */
export class BlockTokenParser extends TokenParser {
    parse(token: Token): Node {
        const {line, column} = token;
        const stream = this.parser.getStream();
        const name = stream.expect(TokenType.NAME).value;

        if (this.parser.hasBlock(name)) {
            throw new TwingErrorSyntax(`The block '${name}' has already been defined line ${this.parser.getBlock(name).line}.`, stream.getCurrent().line, stream.getSourceContext());
        }

        let block = createBlockNode(name, createBaseNode(null), line, column);

        this.parser.setBlock(name, block);
        this.parser.pushLocalScope();
        this.parser.pushBlockStack(name);

        let body;

        if (stream.nextIf(TokenType.TAG_END)) {
            body = this.parser.subparse([this, this.decideBlockEnd], true);

            let token = stream.nextIf(TokenType.NAME);

            if (token) {
                let value = token.value;

                if (value != name) {
                    throw new TwingErrorSyntax(`Expected endblock for block "${name}" (but "${value}" given).`, stream.getCurrent().line, stream.getSourceContext());
                }
            }
        }
        else {
            body = createBaseNode(null, {}, {
                0: createPrintNode(this.parser.parseExpression(), line, column)
            });
        }

        stream.expect(TokenType.TAG_END);

        block.children.body = body;

        this.parser.popBlockStack();
        this.parser.popLocalScope();

        return createBlockReferenceNode(name, line, column, this.getTag());
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endblock');
    }

    getTag() {
        return 'block';
    }
}
