import {parseArguments} from "./include";
import {createEmbedNode} from "../node/include/embed";
import {Token} from "twig-lexer";
import type {TwingTagHandler} from "../tag-handler";

export const createEmbedTagHandler = (): TwingTagHandler => {
    const tag = 'embed';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;

                let parent = parser.parseExpression(stream);

                let embedArguments = parseArguments(parser, stream, line, column);

                let variables = embedArguments.variables;
                let only = embedArguments.only;
                let ignoreMissing = embedArguments.ignoreMissing;

                let parentToken;
                let fakeParentToken;

                parentToken = fakeParentToken = new Token("STRING", '__parent__', token.line, token.column);

                if (parent.is("constant")) {
                    parentToken = new Token("STRING", parent.attributes.value, token.line, token.column);
                } else if (parent.is("name")) {
                    parentToken = new Token("NAME", parent.attributes.name, token.line, token.column);
                }

                // inject a fake parent to make the parent() function work
                stream.injectTokens([
                    new Token("TAG_START", '', token.line, token.column),
                    new Token("NAME", 'extends', token.line, token.column),
                    parentToken,
                    new Token("TAG_END", '', token.line, token.column),
                ]);

                let module = parser.parse(stream, tag, (token: Token) => {
                    return token.test("NAME", 'endembed');
                });

                stream.next();

                // override the parent with the correct one
                if (fakeParentToken === parentToken) {
                    module.children.parent = parent;
                }

                parser.embedTemplate(module);

                stream.expect("TAG_END");

                const {index} = module.attributes;

                return createEmbedNode({
                    index,
                    only,
                    ignoreMissing
                }, {
                    variables
                }, token.line, token.column, tag);
            };
        }
    };
};
