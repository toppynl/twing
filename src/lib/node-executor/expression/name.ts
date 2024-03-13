import {TwingNodeExecutor} from "../../node-executor";
import {TwingNameNode} from "../../node/expression/name";
import {getTraceableMethod} from "../../helpers/traceable-method";
import {getContextValue} from "../../helpers/get-context-value";

export const executeNameNode: TwingNodeExecutor<TwingNameNode> = (node, {
    template,
    context,
    environment
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
        environment.isStrictVariables,
        context,
        name,
        isAlwaysDefined,
        shouldIgnoreStrictCheck,
        shouldTestExistence
    );
};
