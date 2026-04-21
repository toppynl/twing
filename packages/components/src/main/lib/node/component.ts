import type {TwingBaseExpressionNode, TwingBaseNode} from "@toppynl/twing";
import {createBaseNode} from "@toppynl/twing";
import {executeComponentNode, executeComponentNodeSynchronously} from "../node-executor/component";

export type ComponentNodeAttributes = {
    componentName: string;
    templateName: string;
    index: number;
    only: boolean;
};

export type ComponentNodeChildren = {
    variables: TwingBaseExpressionNode;
};

export type ComponentNode = TwingBaseNode<"__twing_components_component__", ComponentNodeAttributes, ComponentNodeChildren> & {
    customExecute: typeof executeComponentNode;
    customExecuteSynchronously: typeof executeComponentNodeSynchronously;
};

export const createComponentNode = (
    componentName: string,
    templateName: string,
    index: number,
    only: boolean,
    variables: TwingBaseExpressionNode,
    line: number,
    column: number,
    tag: string
): ComponentNode => {
    const base = createBaseNode(
        "__twing_components_component__",
        {componentName, templateName, index, only},
        {variables},
        line,
        column,
        tag
    );

    return {
        ...base,
        customExecute: executeComponentNode,
        customExecuteSynchronously: executeComponentNodeSynchronously
    };
};
