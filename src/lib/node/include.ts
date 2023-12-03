import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, TwingExecutionContext} from "../node";
import type {TwingBaseExpressionNode} from "./expression";
import type {TwingTemplate} from "../template";
import {getTraceableMethod} from "../helpers/traceable-method";
import {include} from "../extension/core/functions/include";

export type BaseIncludeNodeAttributes = TwingBaseNodeAttributes & {
    only: boolean;
    ignoreMissing: boolean;
};

export type BaseIncludeNodeChildren = {
    variables: TwingBaseExpressionNode;
};

export interface TwingBaseIncludeNode<
    Type extends string,
    Attributes extends BaseIncludeNodeAttributes = BaseIncludeNodeAttributes,
    Children extends BaseIncludeNodeChildren = BaseIncludeNodeChildren
> extends TwingBaseNode<Type, Attributes, Children> {
}

export const createBaseIncludeNode = <Type extends string, Attributes extends BaseIncludeNodeAttributes, Children extends BaseIncludeNodeChildren = BaseIncludeNodeChildren>(
    type: Type,
    attributes: Attributes,
    children: Children,
    getTemplate: (executionContext: TwingExecutionContext) => Promise<TwingTemplate | null | Array<TwingTemplate | null>>,
    line: number,
    column: number,
    tag: string
): TwingBaseIncludeNode<Type, Attributes, Children> => {
    const baseNode = createBaseNode(type, attributes, children, line, column, tag);

    const node: TwingBaseIncludeNode<Type, Attributes, Children> = {
        ...baseNode,
        execute: async (executionContext) => {
            const {outputBuffer, sandboxed, template} = executionContext;
            const {variables} = node.children;
            const {only, ignoreMissing} = node.attributes;

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

    return node;
};
