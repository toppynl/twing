import type {TwingBaseExpressionNodeAttributes} from "../expression";
import {createBaseNode, TwingBaseNode} from "../../node";
import {getContextValue} from "../../helpers/get-context-value";
import {getTraceableMethod} from "../../helpers/traceable-method";

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
        execute: async ({template, context, charset, isStrictVariables}) => {
            const {name, isAlwaysDefined, shouldIgnoreStrictCheck, shouldTestExistence} = node.attributes;

            const traceableGetContextValue = getTraceableMethod(
                getContextValue,
                node.line,
                node.column,
                template.name
            );
            
            return traceableGetContextValue(
                charset,
                template.name,
                isStrictVariables,
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
