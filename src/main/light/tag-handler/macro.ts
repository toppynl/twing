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
import {createMacroNode, VARARGS_NAME} from "../node/macro";
import {Token} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";
import {getKeyValuePairs} from "../helpers/get-key-value-pairs";
import {createNode} from "../node.js";

export const createMacroTagHandler = (): TwingTagHandler => {
    const tag = 'macro';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;
                const name = stream.expect("NAME").value;
                const macroArguments = parser.parseArguments(stream, true, true);

                for (const {key, value: macroArgument} of getKeyValuePairs(macroArguments)) {
                    const {value: argumentName} = key.attributes;

                    if (argumentName === VARARGS_NAME) {
                        throw createParsingError(`The argument "${VARARGS_NAME}" in macro "${name}" cannot be defined because the variable "${VARARGS_NAME}" is reserved for arbitrary arguments.`, macroArgument, stream.source);
                    }
                }

                stream.expect("TAG_END");

                parser.pushLocalScope();

                const body = parser.subparse(stream, tag, (token: Token) => {
                    return token.test("NAME", 'endmacro');
                });

                stream.next();

                const nextToken = stream.nextIf("NAME");

                if (nextToken) {
                    const value = nextToken.value;

                    if (value != name) {
                        const {line, column} = nextToken;

                        throw createParsingError(`Expected endmacro for macro "${name}" (but "${value}" given).`, {line, column}, stream.source);
                    }
                }

                parser.popLocalScope();

                stream.expect("TAG_END");

                parser.setMacro(name, createMacroNode(name, createNode({body}, line, column), macroArguments, line, column, tag));

                return null;
            };
        }
    };
};
