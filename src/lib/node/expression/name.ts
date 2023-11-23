import type {TwingBaseExpressionNodeAttributes} from "../expression";
import {createBaseNode, TwingBaseNode} from "../../node";
import {getContextValue} from "../../helpers/get-context-value";

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
        execute: (template, context) => {
            const {name, isAlwaysDefined, shouldIgnoreStrictCheck, shouldTestExistence} = node.attributes;

            const traceableGetContextValue = template.getTraceableMethod(
                getContextValue,
                node.line,
                node.column,
                template.templateName
            );

            return traceableGetContextValue(
                template,
                context,
                name,
                isAlwaysDefined,
                shouldIgnoreStrictCheck,
                shouldTestExistence
            );
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
