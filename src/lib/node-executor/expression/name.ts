import {TwingNodeExecutor} from "../../node-executor";
import {TwingNameNode} from "../../node/expression/name";
import {getTraceableMethod} from "../../helpers/traceable-method";
import {getContextValue} from "../../helpers/get-context-value";
import {mergeIterables} from "../../helpers/merge-iterables";
import {createContext} from "../../context";

export const executeNameNode: TwingNodeExecutor<TwingNameNode> = (node, {
    template,
    context,
    environment,
    strict
}) => {
    const {name, isAlwaysDefined, shouldIgnoreStrictCheck, shouldTestExistence} = node.attributes;

    const traceableGetContextValue = getTraceableMethod(
        getContextValue,
        node.line,
        node.column,
        template.name
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
