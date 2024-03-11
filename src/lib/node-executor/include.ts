import {TwingBaseIncludeNode} from "../node/include";
import {getTraceableMethod} from "../helpers/traceable-method";
import {include} from "../extension/core/functions/include";
import {TwingExecutionContext} from "../execution-context";
import {TwingTemplate} from "../template";

export const executeBaseIncludeNode = async (
    node: TwingBaseIncludeNode<any>, 
    executionContext: TwingExecutionContext,
    getTemplate: (executionContext: TwingExecutionContext) => Promise<TwingTemplate | null | Array<TwingTemplate | null>>
) => {
    const {nodeExecutor: execute, outputBuffer, sandboxed, template} = executionContext;
    const {variables} = node.children;
    const {only, ignoreMissing} = node.attributes;

    const templatesToInclude = await getTemplate(executionContext);

    const traceableInclude = getTraceableMethod(include, node.line, node.column, template.name);

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
