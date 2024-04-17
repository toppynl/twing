import {createParsingError} from "../error/parsing";
import {TwingConstantNode, createConstantNode} from "../node/expression/constant";
import {createTraitNode} from "../node/trait";
import {TwingTagHandler} from "../tag-handler";
import {createNode} from "../node";

export const createUseTagHandler = (): TwingTagHandler => {
    const tag = 'use';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;
                const template = parser.parseExpression(stream);

                if (template.type !== "constant") {
                    throw createParsingError('The template references in a "use" statement must be a string.', {line, column}, stream.source);
                }
                
                const targets: Record<string, TwingConstantNode<string>> = {};

                if (stream.nextIf("NAME", 'with')) {
                    do {
                        const name: string = stream.expect("NAME").value;

                        let alias = name;

                        if (stream.nextIf("NAME", 'as')) {
                            alias = stream.expect("NAME").value;
                        }

                        targets[name] = createConstantNode(alias, line, column);

                        if (!stream.nextIf("PUNCTUATION", ',')) {
                            break;
                        }
                    } while (true);
                }

                stream.expect("TAG_END");
                
                parser.addTrait(createTraitNode(template, createNode(targets, line, column), line, column));

                return createNode({}, line, column, tag);
            };
        }
    };
};
