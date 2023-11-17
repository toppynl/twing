import type {TwingBaseExpressionNodeAttributes} from "../expression";
import {createBaseNode, TwingBaseNode} from "../../node";

export type TwingNameNodeAttributes = TwingBaseExpressionNodeAttributes & {
    name: string;
    isAlwaysDefined: boolean;
    shouldIgnoreStrictCheck: boolean;
    shouldTestExistence: boolean;
};

export const nameNodeType = "name";

export interface TwingNameNode extends TwingBaseNode<typeof nameNodeType, TwingNameNodeAttributes> {
}

export const createNameNode = (
    name: string,
    line: number,
    column: number
): TwingNameNode => {
    const attributes: TwingNameNode["attributes"] = {
        name,
        isAlwaysDefined: false,
        shouldIgnoreStrictCheck: false,
        shouldTestExistence: false
    };

    const baseNode = createBaseNode(nameNodeType, attributes, {}, line, column);

    const node: TwingNameNode = {
        ...baseNode,
        compile: (compiler) => {
            const {name, isAlwaysDefined, shouldIgnoreStrictCheck, shouldTestExistence} = attributes;

            compiler
                .write(`await template.getTraceableMethod(runtime.getContextValue, ${node.line}, template.source)(`).write('\n')
                .write('template,').write('\n')
                .write('context,').write('\n')
                .render(name).write(',').write('\n')
                .render(isAlwaysDefined).write(',').write('\n')
                .render(shouldIgnoreStrictCheck).write(',').write('\n')
                .render(shouldTestExistence).write(',').write('\n')
                .write(')')
        }
    };

    return node;
};

export const cloneNameNode = (
    node: TwingNameNode
): TwingNameNode => {
    return createNameNode(
        node.attributes.name,
        node.line,
        node.column
    );
};
