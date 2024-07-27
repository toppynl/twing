import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import {TwingWithNode} from "../node/with";
import {createContext, TwingContext} from "../context";
import {createRuntimeError} from "../error/runtime";
import {mergeIterables} from "../helpers/merge-iterables";
import {iteratorToMap} from "../helpers/iterator-to-map";
import {isPlainObject} from "../helpers/is-plain-object";

export const executeWithNode: TwingNodeExecutor<TwingWithNode> = async (node, executionContext) => {
    const {template, nodeExecutor: execute, context} = executionContext;
    const {variables: variablesNode, body} = node.children;
    const {only} = node.attributes;

    let scopedContext: TwingContext<any, any>;

    if (variablesNode) {
        const variables = await execute(variablesNode, executionContext);

        if (typeof variables !== "object") {
            throw createRuntimeError(`Variables passed to the "with" tag must be a hash.`, node, template.source);
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

export const executeWithNodeSynchronously: TwingSynchronousNodeExecutor<TwingWithNode> = (node, executionContext) => {
    const {template, nodeExecutor: execute, context} = executionContext;
    const {variables: variablesNode, body} = node.children;
    const {only} = node.attributes;

    let scopedContext: Map<string, any>;

    if (variablesNode) {
        let variables = execute(variablesNode, executionContext);
        
        if (isPlainObject(variables)) {
            variables = new Map(Object.entries(variables));
        }

        if (typeof variables !== "object") {
            throw createRuntimeError(`Variables passed to the "with" tag must be a hash.`, node, template.source);
        }

        if (only) {
            scopedContext = new Map();
        } else {
            scopedContext = new Map(context.entries());
        }

        scopedContext = new Map([
            ...scopedContext.entries(),
            ...variables.entries()
        ]);
    } else {
        scopedContext = new Map(context.entries());
    }

    scopedContext.set('_parent', context);

    execute(body, {
        ...executionContext,
        context: scopedContext
    });
};
