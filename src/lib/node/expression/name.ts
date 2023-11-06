import type {BaseExpressionNode, BaseExpressionNodeAttributes} from "../expression";
import {createBaseExpressionNode} from "../expression";

export type BaseNameNodeAttributes = BaseExpressionNodeAttributes & {
    name: string;
    isAlwaysDefined: boolean;
};

export interface BaseNameNode<Type extends string> extends BaseExpressionNode<Type, BaseNameNodeAttributes> {
}

export interface NameNode extends BaseNameNode<'name'> {
}

export const createNameNode = (
    name: string,
    line: number,
    column: number
): NameNode => createBaseNameNode("name", name, line, column);

export const createBaseNameNode = <Type extends string>(
    type: Type,
    name: string,
    line: number,
    column: number
): BaseNameNode<Type> => {
    const specialVars = new Map([
        ['_self', 'template.templateName'],
        ['_context', 'context'],
        ['_charset', 'runtime.getCharset()']
    ]);

    const isSpecial = () => {
        return specialVars.has(name);
    };

    const attributes: NameNode["attributes"] = {
        name,
        isAlwaysDefined: false
    };

    const baseNode = createBaseExpressionNode(type, attributes, {}, line, column);

    const node: BaseNameNode<Type> = {
        ...baseNode,
        compile: (compiler, flags) => {
            const {name, isAlwaysDefined} = attributes;

            if (flags?.isDefinedTest) {
                if (isSpecial()) {
                    compiler.render(true);
                } else {
                    compiler
                        .raw('(context.has(')
                        .render(name)
                        .raw('))');
                }
            } else if (isSpecial()) {
                compiler.raw(specialVars.get(name));
            } else if (isAlwaysDefined) {
                compiler
                    .raw('context.get(')
                    .string(name)
                    .raw(')')
                ;
            } else {
                if (flags?.ignoreStrictCheck || !compiler.options.strictVariables) {
                    compiler
                        .raw('(context.has(')
                        .string(name)
                        .raw(') ? context.get(')
                        .string(name)
                        .raw(') : null)')
                    ;
                } else {
                    compiler
                        .raw('(context.has(')
                        .string(name)
                        .raw(') ? context.get(')
                        .string(name)
                        .raw(') : (() => { throw new runtime.Error(\'Variable ')
                        .string(name)
                        .raw(' does not exist.\', ')
                        .render(line)
                        .raw(', template.source); })()')
                        .raw(')')
                    ;
                }
            }
        }
    };

    return node;
};
