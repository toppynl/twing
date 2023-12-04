import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import type {TwingBaseExpressionNode} from "./expression";
import type {TwingTemplate} from "../template";
import {getTraceableMethod} from "../helpers/traceable-method";
import {include} from "../extension/core/functions/include";
import type {TwingExecutionContext} from "../execution-context";

export type TwingBaseIncludeNodeAttributes = TwingBaseNodeAttributes & {
    only: boolean;
    ignoreMissing: boolean;
};

export type TwingBaseIncludeNodeChildren = {
    variables: TwingBaseExpressionNode;
};

export interface TwingBaseIncludeNode<
    Type extends string,
    Attributes extends TwingBaseIncludeNodeAttributes = TwingBaseIncludeNodeAttributes,
    Children extends TwingBaseIncludeNodeChildren = TwingBaseIncludeNodeChildren
> extends TwingBaseNode<Type, Attributes, Children> {
}

export const createBaseIncludeNode = <Type extends string, Attributes extends TwingBaseIncludeNodeAttributes, Children extends TwingBaseIncludeNodeChildren = TwingBaseIncludeNodeChildren>(
    type: Type,
    attributes: Attributes,
    children: Children,
    getTemplate: (executionContext: TwingExecutionContext) => Promise<TwingTemplate | null | Array<TwingTemplate | null>>,
    line: number,
    column: number,
    tag: string
): TwingBaseIncludeNode<Type, Attributes, Children> => {
    const baseNode = createBaseNode(type, attributes, children, line, column, tag);

    const baseIncludeNode: TwingBaseIncludeNode<Type, Attributes, Children> = {
        ...baseNode,
        execute: async (executionContext) => {
            const {outputBuffer, sandboxed, template} = executionContext;
            const {variables} = baseIncludeNode.children;
            const {only, ignoreMissing} = baseIncludeNode.attributes;

            const templatesToInclude = await getTemplate(executionContext);
            
            const traceableInclude = getTraceableMethod(include, baseNode.line, baseNode.column, template.name);

            const output = await traceableInclude(
                executionContext,
                templatesToInclude,
                await variables.execute(executionContext),
                !only,
                ignoreMissing,
                sandboxed
            );

            outputBuffer.echo(output);
        }
    };

    return baseIncludeNode;
};
