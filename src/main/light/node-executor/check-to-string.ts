import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import {TwingCheckToStringNode} from "../node/check-to-string";
import {getSynchronousTraceableMethod, getTraceableMethod} from "../helpers/traceable-method";

export const executeCheckToStringNode: TwingNodeExecutor<TwingCheckToStringNode> = (node, executionContext) => {
    const {template, environment, nodeExecutor: execute, sandboxed} = executionContext;
    const {value: valueNode} = node.children;
    const {sandboxPolicy} = environment;

    return execute(valueNode, executionContext)
        .then((value) => {
            if (sandboxed) {
                const assertToStringAllowed = getTraceableMethod((value: any) => {
                    if ((value !== null) && (typeof value === 'object')) {
                        try {
                            sandboxPolicy.checkMethodAllowed(value, 'toString');
                        } catch (error) {
                            return Promise.reject(error);
                        }
                    }

                    return Promise.resolve(value);
                }, valueNode, template.source)

                return assertToStringAllowed(value);
            }

            return value;
        });
};

export const executeCheckToStringNodeSynchronously: TwingSynchronousNodeExecutor<TwingCheckToStringNode> = (node, executionContext) => {
    const {template, environment, nodeExecutor: execute, sandboxed} = executionContext;
    const {value: valueNode} = node.children;
    const {sandboxPolicy} = environment;

    const value = execute(valueNode, executionContext);

    if (sandboxed) {
        const assertToStringAllowed = getSynchronousTraceableMethod((value: any) => {
            if ((value !== null) && (typeof value === 'object')) {
                sandboxPolicy.checkMethodAllowed(value, 'toString');
            }

            return value;
        }, valueNode, template.source)

        return assertToStringAllowed(value);
    }

    return value;
};
