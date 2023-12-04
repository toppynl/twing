import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {createRuntimeError} from "../error/runtime";
import {createContext, TwingContext} from "../context";
import {mergeIterables} from "../helpers/merge-iterables";
import {iteratorToMap} from "../helpers/iterator-to-map";
import {TwingBaseExpressionNode} from "./expression";

export type TwingWithNodeAttributes = TwingBaseNodeAttributes & {
    only: boolean;
};

export type TwingWithNodeChildren = {
    body: TwingBaseNode;
    variables?: TwingBaseExpressionNode;
};

export interface TwingWithNode extends TwingBaseNode<"with", TwingWithNodeAttributes, TwingWithNodeChildren> {
}

export const createWithNode = (
    body: TwingBaseNode,
    variables: TwingBaseExpressionNode | null,
    only: boolean,
    line: number,
    column: number,
    tag: string
): TwingWithNode => {
    const children: TwingWithNodeChildren = {
        body
    };

    if (variables) {
        children.variables = variables;
    }

    const baseNode = createBaseNode("with", {
        only
    }, children, line, column, tag);

    const withNode: TwingWithNode = {
        ...baseNode,
        execute: async (executionContext) => {
            const {template, context} = executionContext;
            const {variables: variablesNode, body} = baseNode.children;
            const {only} = baseNode.attributes;

            let scopedContext: TwingContext<any, any>;

            if (variablesNode) {
                const variables = await variablesNode.execute(executionContext);

                if (typeof variables !== "object") {
                    throw createRuntimeError(`Variables passed to the "with" tag must be a hash.`, withNode, template.name);
                }

                if (only) {
                    scopedContext = createContext();
                } else {
                    scopedContext = context.clone();
                }

                scopedContext = createContext(mergeIterables(
                    scopedContext,
                    iteratorToMap(variables)
                ))
            } else {
                scopedContext = context.clone();
            }

            scopedContext.set('_parent', context.clone());

            await body.execute({
                ...executionContext,
                context: scopedContext
            });
        }
    };

    return withNode;
};
