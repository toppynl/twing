import {createDeprecatedNode} from "../node/deprecated";
import {TokenType} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

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
export const createDeprecatedTagHandler = (): TwingTagHandler => {
    const tag = 'deprecated';
    
    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const expression = parser.parseExpression(stream);

                stream.expect(TokenType.TAG_END);

                return createDeprecatedNode(expression, token.line, token.column, tag);
            };
        }
    };
};
