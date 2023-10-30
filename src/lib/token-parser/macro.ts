/**
 * Defines a macro.
 *
 * <pre>
 * {% macro input(name, value, type, size) %}
 *    <input type="{{ type|default('text') }}" name="{{ name }}" value="{{ value|e }}" size="{{ size|default(20) }}" />
 * {% endmacro %}
 * </pre>
 */
import {TokenParser} from "../token-parser";
import {TwingErrorSyntax} from "../error/syntax";
import {createBodyNode} from "../node/body";
import {createMacroNode, VARARGS_NAME} from "../node/macro";
import {Token, TokenType} from "twig-lexer";
import {getChildren} from "../node";

export class MacroTokenParser extends TokenParser {
    parse(token: Token) {
        const {line, column} = token;
        const stream = this.parser.getStream();
        const name = stream.expect(TokenType.NAME).value;
        const macroArguments = this.parser.parseArguments(true, true);

        for (const [argumentName, macroArgument] of getChildren(macroArguments)) {
            if (argumentName === VARARGS_NAME) {
                throw new TwingErrorSyntax(`The argument "${VARARGS_NAME}" in macro "${name}" cannot be defined because the variable "${VARARGS_NAME}" is reserved for arbitrary arguments.`, macroArgument.line);
            }
        }

        stream.expect(TokenType.TAG_END);

        this.parser.pushLocalScope();

        const body = this.parser.subparse([this, this.decideBlockEnd], true);
        const nextToken = stream.nextIf(TokenType.NAME);

        if (nextToken) {
            const value = nextToken.value;

            if (value != name) {
                throw new TwingErrorSyntax(`Expected endmacro for macro "${name}" (but "${value}" given).`, stream.getCurrent().line, stream.getSourceContext());
            }
        }

        this.parser.popLocalScope();

        stream.expect(TokenType.TAG_END);

        this.parser.setMacro(name, createMacroNode(name, createBodyNode(body, line, column), macroArguments, line, column, this.getTag()));

        return null;
    }

    decideBlockEnd(token: Token) {
        return token.test(TokenType.NAME, 'endmacro');
    }

    getTag() {
        return 'macro';
    }
}
