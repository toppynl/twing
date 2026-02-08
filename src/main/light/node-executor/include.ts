import {TwingBaseIncludeNode} from "../node/include";
import {getSynchronousTraceableMethod, getTraceableMethod} from "../helpers/traceable-method";
import {include, includeSynchronously} from "../extension/core/functions/include";
import {TwingExecutionContext, TwingSynchronousExecutionContext} from "../execution-context";
import {TwingSynchronousTemplate, TwingTemplate} from "../template";
import {isPlainObject} from "../helpers/is-plain-object";

export const executeBaseIncludeNode = async (
    node: TwingBaseIncludeNode<any>, 
    executionContext: TwingExecutionContext,
    getTemplate: (executionContext: TwingExecutionContext) => Promise<TwingTemplate | null | Array<TwingTemplate | null>>
) => {
    const {nodeExecutor: execute, outputBuffer, sandboxed, template} = executionContext;
    const {variables} = node.children;
    const {only, ignoreMissing} = node.attributes;

    const templatesToInclude = await getTemplate(executionContext);
    
    const traceableInclude = getTraceableMethod(include, node, template.source);

    const output = await traceableInclude(
        executionContext,
        templatesToInclude,
        await execute(variables, executionContext),
        !only,
        ignoreMissing,
        sandboxed
    );

    outputBuffer.echo(output);
};

export const executeBaseIncludeNodeSynchronously = (
    node: TwingBaseIncludeNode<any>,
    executionContext: TwingSynchronousExecutionContext,
    getTemplate: (executionContext: TwingSynchronousExecutionContext) => TwingSynchronousTemplate | null | Array<TwingSynchronousTemplate | null>
) => {
    const {nodeExecutor: execute, outputBuffer, sandboxed, template} = executionContext;
    const {variables: variablesNode} = node.children;
    const {only, ignoreMissing} = node.attributes;

    const templatesToInclude = getTemplate(executionContext);
    const traceableInclude = getSynchronousTraceableMethod(includeSynchronously, node, template.source);
    
    let variables = execute(variablesNode, executionContext);
    
    if (isPlainObject(variables)) {
        variables = new Map(Object.entries(variables));
    }
    
    const output = traceableInclude(
        executionContext,
        templatesToInclude,
        variables,
        !only,
        ignoreMissing,
        sandboxed
    );

    outputBuffer.echo(output);
};
