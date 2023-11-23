import {parseArguments} from "./include";
import {createEmbedNode} from "../node/include/embed";
import {Token, TokenType} from "twig-lexer";
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

                parentToken = fakeParentToken = new Token(TokenType.STRING, '__parent__', token.line, token.column);

                if (parent.is("constant")) {
                    parentToken = new Token(TokenType.STRING, parent.attributes.value, token.line, token.column);
                } else if (parent.is("name")) {
                    parentToken = new Token(TokenType.NAME, parent.attributes.name, token.line, token.column);
                }

                // inject a fake parent to make the parent() function work
                stream.injectTokens([
                    new Token(TokenType.TAG_START, '', token.line, token.column),
                    new Token(TokenType.NAME, 'extends', token.line, token.column),
                    parentToken,
                    new Token(TokenType.TAG_END, '', token.line, token.column),
                ]);
                
                let module = parser.parse(stream, tag, (token: Token) => {
                    return token.test(TokenType.NAME, 'endembed');
                }, true);

                // override the parent with the correct one
                if (fakeParentToken === parentToken) {
                    module.children.parent = parent;
                }

                parser.embedTemplate(module);
                
                stream.expect(TokenType.TAG_END);

                const {source, index} = module.attributes;
                
                return createEmbedNode({
                    templateName: source.name,
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
