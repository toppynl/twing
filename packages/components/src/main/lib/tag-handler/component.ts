import type {TwingBaseExpressionNode, TwingTagHandler} from "@toppynl/twing";
import {createArrayNode} from "@toppynl/twing";
import {Token} from "twig-lexer";
import {createComponentNode} from "../node/component";

export type ComponentTemplateFinder = (componentName: string) => string;

export const createComponentTagHandler = (templateFinder: ComponentTemplateFinder): TwingTagHandler => {
    const tag = "component";

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;

                const nameExpression = parser.parseExpression(stream);

                if (nameExpression.type !== "constant") {
                    throw new Error(`Component name must be a string literal at line ${line}, column ${column}.`);
                }

                const componentName = String((nameExpression as any).attributes.value);
                const templateName = templateFinder(componentName);

                let variables: TwingBaseExpressionNode = createArrayNode([], line, column);

                if (stream.nextIf("NAME", "with")) {
                    variables = parser.parseExpression(stream);
                }

                let only = false;

                if (stream.nextIf("NAME", "only")) {
                    only = true;
                }

                stream.expect("TAG_END");

                stream.injectTokens([
                    new Token("TAG_START", "", token.line, token.column),
                    new Token("NAME", "extends", token.line, token.column),
                    new Token("STRING", templateName, token.line, token.column),
                    new Token("TAG_END", "", token.line, token.column)
                ]);

                const module = parser.parse(stream, tag, (token) => token.test("NAME", "endcomponent"));

                stream.next();
                parser.embedTemplate(module);
                stream.expect("TAG_END");

                const {index} = (module as any).attributes;

                return createComponentNode(
                    componentName,
                    templateName,
                    index,
                    only,
                    variables,
                    line,
                    column,
                    tag
                );
            };
        }
    };
};
