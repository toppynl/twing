import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, TwingNode} from "../node";
import {createRuntimeError} from "../error/runtime";
import {createContext, TwingContext} from "../context";
import {mergeIterables} from "../helpers/merge-iterables";
import {iteratorToMap} from "../helpers/iterator-to-map";

export type TwingWithNodeAttributes = TwingBaseNodeAttributes & {
    only: boolean;
};

export type TwingWithNodeChildren = {
    body: TwingNode;
    variables?: TwingNode;
};

export interface TwingWithNode extends TwingBaseNode<"with", TwingWithNodeAttributes, TwingWithNodeChildren> {
}

export const createWithNode = (
    body: TwingNode,
    variables: TwingNode | null,
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

    const node: TwingWithNode = {
        ...baseNode,
        execute: async (executionContext) => {
            const {template, context} = executionContext;
            const {variables: variablesNode, body} = baseNode.children;
            const {only} = baseNode.attributes;

            let scopedContext: TwingContext<any, any>;

            if (variablesNode) {
                const variables = await variablesNode.execute(executionContext);

                if (typeof variables !== "object") {
                    throw createRuntimeError(`Variables passed to the "with" tag must be a hash.`, node, template.name);
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

    return node;
};
