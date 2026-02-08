import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../../node-executor";
import {TwingNameNode} from "../../node/expression/name";
import {getSynchronousTraceableMethod, getTraceableMethod} from "../../helpers/traceable-method";
import {getContextValue, getContextValueSynchronously} from "../../helpers/get-context-value";
import {createContext} from "../../context";
import {mergeIterables} from "../../helpers/merge-iterables";

export const executeNameNode: TwingNodeExecutor<TwingNameNode> = (node, {
    template,
    context,
    environment,
    strict
}) => {
    const {name, isAlwaysDefined, shouldIgnoreStrictCheck, shouldTestExistence} = node.attributes;

    const traceableGetContextValue = getTraceableMethod(
        getContextValue,
        node,
        template.source
    );
    
    return traceableGetContextValue(
        environment.charset,
        template.name,
        strict,
        createContext(mergeIterables(environment.globals, context)),
        name,
        isAlwaysDefined,
        shouldIgnoreStrictCheck,
        shouldTestExistence
    );
};

export const executeNameNodeSynchronously: TwingSynchronousNodeExecutor<TwingNameNode> = (node, {
    template,
    context,
    environment,
    strict
}) => {
    const {name, isAlwaysDefined, shouldIgnoreStrictCheck, shouldTestExistence} = node.attributes;

    const traceableGetContextValue = getSynchronousTraceableMethod(
        getContextValueSynchronously,
        node,
        template.source
    );

    return traceableGetContextValue(
        environment.charset,
        template.name,
        strict,
        // todo: this is needed for the for loop to work properly when the sequence is the context, but this should not be needed
        new Map(context.entries()),
        environment.globals,
        name,
        isAlwaysDefined,
        shouldIgnoreStrictCheck,
        shouldTestExistence
    );
};
