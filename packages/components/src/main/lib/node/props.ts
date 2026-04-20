import type {TwingBaseExpressionNode, TwingBaseNode} from "twing";
import {createBaseNode} from "twing";
import {executePropsNode, executePropsNodeSynchronously} from "../node-executor/props";

export type PropDefaults = Record<string, TwingBaseExpressionNode>;

export type PropsNodeAttributes = {
    names: Array<string>;
};

export type PropsNode = TwingBaseNode<"__twing_components_props__", PropsNodeAttributes, PropDefaults> & {
    customExecute: typeof executePropsNode;
    customExecuteSynchronously: typeof executePropsNodeSynchronously;
};

export const createPropsNode = (
    names: Array<string>,
    defaults: PropDefaults,
    line: number,
    column: number,
    tag: string
): PropsNode => {
    const base = createBaseNode(
        "__twing_components_props__",
        {names},
        defaults,
        line,
        column,
        tag
    );

    return {
        ...base,
        customExecute: executePropsNode,
        customExecuteSynchronously: executePropsNodeSynchronously
    };
};
