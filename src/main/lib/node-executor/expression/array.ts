import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../../node-executor";
import {type TwingBaseArrayNode} from "../../node/expression/array";
import type {TwingNode} from "../../node";
import {getKeyValuePairs} from "../../helpers/get-key-value-pairs";
import {getValues} from "../../context";

export const executeArrayNode: TwingNodeExecutor<TwingBaseArrayNode<any>> = async (baseNode, executionContext) => {
    const {nodeExecutor: execute} = executionContext;
    const keyValuePairs = getKeyValuePairs(baseNode);
    const array: Array<any> = [];

    for (const {value: valueNode} of keyValuePairs) {
        const value = await execute(valueNode, executionContext);

        if ((valueNode as TwingNode).type === "spread") {
            array.push(...value);
        } else {
            array.push(value);
        }
    }

    return array;
};

export const executeArrayNodeSynchronously: TwingSynchronousNodeExecutor<TwingBaseArrayNode<any>> = (baseNode, executionContext) => {
    const {nodeExecutor: execute} = executionContext;
    const keyValuePairs = getKeyValuePairs(baseNode);
    const array: Array<any> = [];

    for (const {value: valueNode} of keyValuePairs) {
        const value = execute(valueNode, executionContext);

        if ((valueNode as TwingNode).type === "spread") {
            const values = getValues(value);
            
            array.push(...values);
        } else {
            array.push(value);
        }
    }

    return array;
};
