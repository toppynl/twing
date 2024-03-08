import {TwingNodeExecutor} from "../node-executor";
import {TwingWithNode} from "../node/with";
import {createContext, TwingContext} from "../context";
import {createRuntimeError} from "../error/runtime";
import {mergeIterables} from "../helpers/merge-iterables";
import {iteratorToMap} from "../helpers/iterator-to-map";

export const executeWithNode: TwingNodeExecutor<TwingWithNode> = async (node, executionContext) => {
    const {template, nodeExecutor: execute, context} = executionContext;
    const {variables: variablesNode, body} = node.children;
    const {only} = node.attributes;

    let scopedContext: TwingContext<any, any>;

    if (variablesNode) {
        const variables = await execute(variablesNode, executionContext);

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

    await execute(body, {
        ...executionContext,
        context: scopedContext
    });
};
