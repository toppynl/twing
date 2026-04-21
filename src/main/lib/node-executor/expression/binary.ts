import type {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../../node-executor";
import type {TwingBaseBinaryNode} from "../../node/expression/binary";
import {compare} from "../../helpers/compare";
import {concatenate} from "../../helpers/concatenate";
import {every, everySynchronously, isAMapLike, some, someSynchronously} from "../../helpers/map-like";
import {isIn} from "../../helpers/is-in";
import {parseRegularExpression} from "../../helpers/parse-regular-expression";
import {createRange} from "../../helpers/create-range";
import {createRuntimeError} from "../../error/runtime";

export const executeBinaryNode: TwingNodeExecutor<TwingBaseBinaryNode<any>> = async (node, executionContext) => {
    const {left, right} = node.children;
    const {nodeExecutor: execute, template} = executionContext;

    switch (node.type) {
        case "add": {
            const leftValue = await execute(left, executionContext);
            const leftValueType = typeof leftValue;
            
            if (leftValueType === "string") {
                return Promise.reject(createRuntimeError(`Unsupported operand type "${leftValueType}"`, left, template.source));
            }

            const rightValue = await execute(right, executionContext);
            const rightValueType = typeof rightValue;

            if (rightValueType === "string") {
                return Promise.reject(createRuntimeError(`Unsupported operand type "${rightValueType}"`, right, template.source));
            }
            
            return leftValue + rightValue;
        }
        case "and": {
            return !!(await execute(left, executionContext) && await execute(right, executionContext));
        }
        case "bitwise_and": {
            return await execute(left, executionContext) & await execute(right, executionContext);
        }
        case "bitwise_or": {
            return await execute(left, executionContext) | await execute(right, executionContext);
        }
        case "bitwise_xor": {
            return await execute(left, executionContext) ^ await execute(right, executionContext);
        }
        case "concatenate": {
            const leftValue = await execute(left, executionContext);
            const rightValue = await execute(right, executionContext);

            return concatenate(leftValue, rightValue);
        }
        case "divide": {
            return await execute(left, executionContext) / await execute(right, executionContext);
        }
        case "divide_and_floor": {
            return Math.floor(await execute(left, executionContext) / await execute(right, executionContext));
        }
        case "ends_with": {
            const leftValue = await execute(left, executionContext);

            if (typeof leftValue !== "string") {
                return false;
            }

            const rightValue = await execute(right, executionContext);

            if (typeof rightValue !== "string") {
                return false;
            }

            return rightValue.length < 1 || leftValue.endsWith(rightValue);
        }
        case "has_every": {
            const leftValue = await execute(left, executionContext);
            const rightValue = await execute(right, executionContext);

            if (typeof rightValue !== "function") {
                return Promise.resolve(true);
            }

            if (!isAMapLike(leftValue) && !Array.isArray(leftValue)) {
                return Promise.resolve(true);
            }

            return every(leftValue, rightValue);
        }
        case "has_some": {
            const leftValue = await execute(left, executionContext);
            const rightValue = await execute(right, executionContext);

            if (typeof rightValue !== "function") {
                return Promise.resolve(false);
            }

            if (!isAMapLike(leftValue) && !Array.isArray(leftValue)) {
                return Promise.resolve(false);
            }

            return some(leftValue, rightValue);
        }
        case "is_equal_to": {
            const leftValue = await execute(left, executionContext);
            const rightValue = await execute(right, executionContext);

            return compare(leftValue, rightValue);
        }
        case "is_greater_than": {
            return await execute(left, executionContext) > await execute(right, executionContext);
        }
        case "is_greater_than_or_equal_to": {
            return await execute(left, executionContext) >= await execute(right, executionContext);
        }
        case "is_in": {
            return isIn(await execute(left, executionContext), await execute(right, executionContext));
        }
        case "is_less_than": {
            return await execute(left, executionContext) < await execute(right, executionContext);
        }
        case "is_less_than_or_equal_to": {
            return await execute(left, executionContext) <= await execute(right, executionContext);
        }
        case "is_not_equal_to": {
            return Promise.resolve(!compare(await execute(left, executionContext), await execute(right, executionContext)))
        }
        case "is_strictly_equal_to": {
            const leftValue = await execute(left, executionContext);
            const rightValue = await execute(right, executionContext);
            return leftValue === rightValue;
        }
        case "is_not_in": {
            return Promise.resolve(!isIn(await execute(left, executionContext), await execute(right, executionContext)))
        }
        case "matches": {
            return parseRegularExpression(
                await execute(right, executionContext)
            ).test(
                await execute(left, executionContext)
            );
        }
        case "modulo": {
            return await execute(left, executionContext) % await execute(right, executionContext);
        }
        case "multiply": {
            return await execute(left, executionContext) * await execute(right, executionContext);
        }
        case "or": {
            return !!(await execute(left, executionContext) || await execute(right, executionContext));
        }
        case "power": {
            return Math.pow(await execute(left, executionContext), await execute(right, executionContext));
        }
        case "range": {
            const leftValue = await execute(left, executionContext);
            const rightValue = await execute(right, executionContext);

            return createRange(leftValue, rightValue, 1);
        }
        case "spaceship": {
            const leftValue = await execute(left, executionContext);
            const rightValue = await execute(right, executionContext);

            return compare(leftValue, rightValue) ? 0 : (leftValue < rightValue ? -1 : 1);
        }
        case "starts_with": {
            const leftValue = await execute(left, executionContext);

            if (typeof leftValue !== "string") {
                return false;
            }

            const rightValue = await execute(right, executionContext);

            if (typeof rightValue !== "string") {
                return false;
            }

            return rightValue.length < 1 || leftValue.startsWith(rightValue);
        }
        case "subtract": {
            return await execute(left, executionContext) - await execute(right, executionContext);
        }
    }

    return Promise.reject(createRuntimeError(`Unrecognized binary node of type "${node.type}"`, node, template.source));
};

export const executeBinaryNodeSynchronously: TwingSynchronousNodeExecutor<TwingBaseBinaryNode<any>> = (node, executionContext): boolean | number | string | Map<number, any> => {
    const {left, right} = node.children;
    const {nodeExecutor: execute, template} = executionContext;

    switch (node.type) {
        case "add": {
            const leftValue = execute(left, executionContext);
            const leftValueType = typeof leftValue;

            if (leftValueType === "string") {
                throw(createRuntimeError(`Unsupported operand type "${leftValueType}"`, left, template.source));
            }

            const rightValue = execute(right, executionContext);
            const rightValueType = typeof rightValue;

            if (rightValueType === "string") {
                throw(createRuntimeError(`Unsupported operand type "${rightValueType}"`, right, template.source));
            }
            
            return leftValue + rightValue;
        }
        case "and": {
            return !!(execute(left, executionContext) && execute(right, executionContext));
        }
        case "bitwise_and": {
            return execute(left, executionContext) & execute(right, executionContext);
        }
        case "bitwise_or": {
            return execute(left, executionContext) | execute(right, executionContext);
        }
        case "bitwise_xor": {
            return execute(left, executionContext) ^ execute(right, executionContext);
        }
        case "concatenate": {
            const leftValue = execute(left, executionContext);
            const rightValue = execute(right, executionContext);

            return concatenate(leftValue, rightValue);
        }
        case "divide": {
            return execute(left, executionContext) / execute(right, executionContext);
        }
        case "divide_and_floor": {
            return Math.floor(execute(left, executionContext) / execute(right, executionContext));
        }
        case "ends_with": {
            const leftValue = execute(left, executionContext);

            if (typeof leftValue !== "string") {
                return false;
            }

            const rightValue = execute(right, executionContext);

            if (typeof rightValue !== "string") {
                return false;
            }

            return rightValue.length < 1 || leftValue.endsWith(rightValue);
        }
        case "has_every": {
            const leftValue = execute(left, executionContext);
            const rightValue = execute(right, executionContext);

            if (typeof rightValue !== "function") {
                return true;
            }

            if (!isAMapLike(leftValue) && !Array.isArray(leftValue)) {
                return true;
            }

            return everySynchronously(leftValue, rightValue);
        }
        case "has_some": {
            const leftValue = execute(left, executionContext);
            const rightValue = execute(right, executionContext);

            if (typeof rightValue !== "function") {
                return false;
            }

            if (!isAMapLike(leftValue) && !Array.isArray(leftValue)) {
                return false;
            }

            return someSynchronously(leftValue, rightValue);
        }
        case "is_equal_to": {
            const leftValue = execute(left, executionContext);
            const rightValue = execute(right, executionContext);

            return compare(leftValue, rightValue);
        }
        case "is_greater_than": {
            return execute(left, executionContext) > execute(right, executionContext);
        }
        case "is_greater_than_or_equal_to": {
            return execute(left, executionContext) >= execute(right, executionContext);
        }
        case "is_in": {
            return isIn(execute(left, executionContext), execute(right, executionContext));
        }
        case "is_less_than": {
            return execute(left, executionContext) < execute(right, executionContext);
        }
        case "is_less_than_or_equal_to": {
            return execute(left, executionContext) <= execute(right, executionContext);
        }
        case "is_not_equal_to": {
            return !compare(execute(left, executionContext), execute(right, executionContext));
        }
        case "is_strictly_equal_to": {
            const leftValue = execute(left, executionContext);
            const rightValue = execute(right, executionContext);
            return leftValue === rightValue;
        }
        case "is_not_in": {
            return !isIn(execute(left, executionContext), execute(right, executionContext));
        }
        case "matches": {
            return parseRegularExpression(
                execute(right, executionContext)
            ).test(
                execute(left, executionContext)
            );
        }
        case "modulo": {
            return execute(left, executionContext) % execute(right, executionContext);
        }
        case "multiply": {
            return execute(left, executionContext) * execute(right, executionContext);
        }
        case "or": {
            return !!(execute(left, executionContext) || execute(right, executionContext));
        }
        case "power": {
            return Math.pow(execute(left, executionContext), execute(right, executionContext));
        }
        case "range": {
            const leftValue = execute(left, executionContext);
            const rightValue = execute(right, executionContext);

            return createRange(leftValue, rightValue, 1);
        }
        case "spaceship": {
            const leftValue = execute(left, executionContext);
            const rightValue = execute(right, executionContext);

            return compare(leftValue, rightValue) ? 0 : (leftValue < rightValue ? -1 : 1);
        }
        case "starts_with": {
            const leftValue = execute(left, executionContext);

            if (typeof leftValue !== "string") {
                return false;
            }

            const rightValue = execute(right, executionContext);

            if (typeof rightValue !== "string") {
                return false;
            }

            return rightValue.length < 1 || leftValue.startsWith(rightValue);
        }
        case "subtract": {
            return execute(left, executionContext) - execute(right, executionContext);
        }
    }

    throw createRuntimeError(`Unrecognized binary node of type "${node.type}"`, node, template.source);
};
