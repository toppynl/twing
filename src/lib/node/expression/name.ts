import type {BaseExpressionNode, BaseExpressionNodeAttributes} from "../expression";
import {createBaseExpressionNode} from "../expression";

export type BaseNameNodeAttributes = BaseExpressionNodeAttributes & {
    name: string;
    is_defined_test: boolean;
    always_defined: boolean;
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
        always_defined: false,
        is_defined_test: false,
        ignore_strict_check: false,
        optimizable: false
    };

    const createFromAttributes = (
        attributes: NameNode["attributes"]
    ): BaseNameNode<Type> => {
        const baseNode = createBaseExpressionNode(type, attributes, {}, line, column);

        const node = {
            ...baseNode,
            compile: (compiler) => {
                const {name, always_defined, ignore_strict_check, is_defined_test} = attributes;

                if (is_defined_test) {
                    if (isSpecial()) {
                        compiler.render(true);
                    } else {
                        compiler.raw('(context.has(').render(name).raw('))');
                    }
                } else if (isSpecial()) {
                    compiler.raw(specialVars.get(name));
                } else if (always_defined) {
                    compiler
                        .raw('context.get(')
                        .string(name)
                        .raw(')')
                    ;
                } else {
                    if (ignore_strict_check || !compiler.options.strictVariables) {
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
                            .raw(') : (() => { throw runtime.createRuntimeError(\'Variable ')
                            .string(name)
                            .raw(' does not exist.\', ')
                            .render(line)
                            .raw(', template.source); })()')
                            .raw(')')
                        ;
                    }
                }
            },
            clone: () => createFromAttributes({...node.attributes})
        };

        return node;
    }

    return createFromAttributes(attributes);
};
