import type {TwingBaseExpressionNodeAttributes} from "../expression";
import {createBaseNode, TwingBaseNode} from "../../node";
import {getContextValue} from "../../helpers/get-context-value";
import {getTraceableMethod} from "../../helpers/traceable-method";
import {mergeIterables} from "../../helpers/merge-iterables";
import {createContext} from "../../context";

export type TwingNameNodeAttributes = TwingBaseExpressionNodeAttributes & {
    name: string;
    isAlwaysDefined: boolean;
    shouldIgnoreStrictCheck: boolean;
    shouldTestExistence: boolean;
};

export interface TwingNameNode extends TwingBaseNode<"name", TwingNameNodeAttributes> {
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

    const baseNode = createBaseNode("name", attributes, {}, line, column);

    const nameNode: TwingNameNode = {
        ...baseNode,
        execute: async ({template, context, charset, isStrictVariables, globals}) => {
            const {name, isAlwaysDefined, shouldIgnoreStrictCheck, shouldTestExistence} = nameNode.attributes;

            const traceableGetContextValue = getTraceableMethod(
                getContextValue,
                nameNode.line,
                nameNode.column,
                template.name
            );

            return traceableGetContextValue(
                charset,
                template.name,
                isStrictVariables,
                createContext(mergeIterables(globals, context)),
                name,
                isAlwaysDefined,
                shouldIgnoreStrictCheck,
                shouldTestExistence
            );
        }
    };

    return nameNode;
};

export const cloneNameNode = (
    nameNode: TwingNameNode
): TwingNameNode => {
    return createNameNode(
        nameNode.attributes.name,
        nameNode.line,
        nameNode.column
    );
};
