/**
 * Defines a macro.
 *
 * <pre>
 * {% macro input(name, value, type, size) %}
 *    <input type="{{ type|default('text') }}" name="{{ name }}" value="{{ value|e }}" size="{{ size|default(20) }}" />
 * {% endmacro %}
 * </pre>
 */
import {createParsingError} from "../error/parsing";
import {createBodyNode} from "../node/body";
import {createMacroNode, VARARGS_NAME} from "../node/macro";
import {Token, TokenType} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";
import {getKeyValuePairs} from "../node/expression/array";

export const createMacroTagHandler = (): TwingTagHandler => {
    const tag = 'macro';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;
                const name = stream.expect(TokenType.NAME).value;
                const macroArguments = parser.parseArguments(stream, true, true);

                for (const {key, value: macroArgument} of getKeyValuePairs(macroArguments)) {
                    const {value: argumentName} = key.attributes;

                    if (argumentName === VARARGS_NAME) {
                        throw createParsingError(`The argument "${VARARGS_NAME}" in macro "${name}" cannot be defined because the variable "${VARARGS_NAME}" is reserved for arbitrary arguments.`, macroArgument.line);
                    }
                }

                stream.expect(TokenType.TAG_END);

                parser.pushLocalScope();

                const body = parser.subparse(stream, tag, (token: Token) => {
                    return token.test(TokenType.NAME, 'endmacro');
                }, true);
                const nextToken = stream.nextIf(TokenType.NAME);

                if (nextToken) {
                    const value = nextToken.value;

                    if (value != name) {
                        const {line, column} = nextToken;

                        throw createParsingError(`Expected endmacro for macro "${name}" (but "${value}" given).`, line, column, stream.source);
                    }
                }

                parser.popLocalScope();

                stream.expect(TokenType.TAG_END);

                parser.setMacro(name, createMacroNode(name, createBodyNode(body, line, column), macroArguments, line, column, tag));

                return null;
            };
        }
    };
};
