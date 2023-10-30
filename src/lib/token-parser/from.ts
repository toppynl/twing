import {TokenParser} from "../token-parser";
import {createImportNode} from "../node/import";
import {createAssignNameNode} from "../node/expression/assign-name";
import {Token, TokenType} from "twig-lexer";

/**
 * Imports macros.
 *
 * <pre>
 *   {% from 'forms.html' import forms %}
 * </pre>
 */
export class TwingTokenParserFrom extends TokenParser {
    parse(token: Token) {
        let macro = this.parser.parseExpression();
        let stream = this.parser.getStream();

        stream.expect(TokenType.NAME, 'import');

        let targets = new Map();

        do {
            let name = stream.expect(TokenType.NAME).value;
            let alias = name;

            if (stream.nextIf(TokenType.NAME, 'as')) {
                alias = stream.expect(TokenType.NAME).value;
            }

            targets.set(name, alias);

            if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                break;
            }
        } while (true);

        stream.expect(TokenType.TAG_END);

        let expr = createAssignNameNode(this.parser.getVarName(), token.line, token.column);
        let node = createImportNode(macro, expr, true, token.line, token.column, this.getTag());

        for (let [name, alias] of targets) {
            this.parser.addImportedSymbol('function', alias, name, expr);
        }

        return node;
    }

    getTag() {
        return 'from';
    }
}
