import {TwingParsingError} from "../error/parsing";
import {TwingConstantNode, createConstantNode} from "../node/expression/constant";
import {createBaseNode} from "../node";
import {TokenType} from "twig-lexer";
import {createTraitNode} from "../node/trait";
import {TwingTagHandler} from "../tag-handler";
import {createArgumentsNode} from "../node/expression/arguments";

export const createUseTagHandler = (): TwingTagHandler => {
    const tag = 'use';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;
                const template = parser.parseExpression(stream);

                if (!template.is("constant")) {
                    throw new TwingParsingError('The template references in a "use" statement must be a string.', line, column, stream.source);
                }
                
                const targets: Record<string, TwingConstantNode> = {};

                if (stream.nextIf(TokenType.NAME, 'with')) {
                    do {
                        const name: string = stream.expect(TokenType.NAME).value;

                        let alias = name;

                        if (stream.nextIf(TokenType.NAME, 'as')) {
                            alias = stream.expect(TokenType.NAME).value;
                        }

                        targets[name] = createConstantNode(alias, line, column);

                        if (!stream.nextIf(TokenType.PUNCTUATION, ',')) {
                            break;
                        }
                    } while (true);
                }

                stream.expect(TokenType.TAG_END);

                parser.addTrait(createTraitNode(template, createArgumentsNode(targets, line, column), line, column));

                return createBaseNode(null);
            };
        }
    };
};
