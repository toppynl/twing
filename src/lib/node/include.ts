import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import type {TwingBaseExpressionNode} from "./expression";
import type {TwingTemplate, TwingTemplateAliases, TwingTemplateBlockMap} from "../template";
import type {TwingContext} from "../context";
import type {TwingOutputBuffer} from "../output-buffer";
import {TwingSourceMapRuntime} from "../source-map-runtime";

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
    getTemplate: (
        template: TwingTemplate,
        context: TwingContext<any, any>,
        outputBuffer: TwingOutputBuffer,
        blocks: TwingTemplateBlockMap,
        aliases: TwingTemplateAliases,
        sourceMapRuntime?: TwingSourceMapRuntime
    ) => Promise<TwingTemplate | null>,
    line: number,
    column: number,
    tag: string
): TwingBaseIncludeNode<Type, Attributes, Children> => {
    const baseNode = createBaseNode(type, attributes, children, line, column, tag);

    const node: TwingBaseIncludeNode<Type, Attributes, Children> = {
        ...baseNode,
        execute: async (...args) => {
            const [template, context, outputBuffer, , , sourceMapRuntime] = args;
            const {include} = template;
            const {variables} = node.children;
            const {only, ignoreMissing} = node.attributes;

            const templateToInclude = await getTemplate(...args);

            const traceableInclude = template.getTraceableMethod(include, baseNode.line, baseNode.column, template.templateName);

            const output = await traceableInclude(
                template,
                context,
                outputBuffer,
                sourceMapRuntime || null,
                templateToInclude,
                await variables.execute(...args),
                !only,
                ignoreMissing,
                false,
                node.line,
                node.column
            );

            outputBuffer.echo(output);
        }
    };

    return node;
};
