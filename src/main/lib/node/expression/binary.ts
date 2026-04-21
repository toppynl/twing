import type {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes} from "../expression";
import type {TwingNodeType} from "../../node";
import type {TwingAddNode} from "./binary/add";
import type {TwingAndNode} from "./binary/and";
import type {TwingBitwiseAndNode} from "./binary/bitwise-and";
import type {TwingBitwiseOrNode} from "./binary/bitwise-or";
import type {TwingConcatenateNode} from "./binary/concatenate";
import type {TwingEndsWithNode} from "./binary/ends-with";
import type {TwingIsGreaterThanNode} from "./binary/is-greater-than";
import type {TwingIsGreaterThanOrEqualToNode} from "./binary/is-greater-than-or-equal-to";
import type {TwingBitwiseXorNode} from "./binary/bitwise-xor";
import type {TwingDivideNode} from "./binary/divide";
import type {TwingIsEqualToNode} from "./binary/is-equal-to";
import type {TwingDivideAndFloorNode} from "./binary/divide-and-floor";
import type {TwingIsInNode} from "./binary/is-in";
import type {TwingIsLessThanNode} from "./binary/is-less-than";
import type {TwingIsLessThanOrEqualToNode} from "./binary/is-less-than-or-equal-to";
import type {TwingMatchesNode} from "./binary/matches";
import type {TwingModuloNode} from "./binary/modulo";
import type {TwingMultiplyNode} from "./binary/multiply";
import type {TwingIsNotEqualToNode} from "./binary/is-not-equal-to";
import type {TwingIsNotStrictlyEqualToNode} from "./binary/is-not-strictly-equal-to";
import type {TwingIsNotInNode} from "./binary/is-not-in";
import type {TwingIsStrictlyEqualToNode} from "./binary/is-strictly-equal-to";
import type {TwingOrNode} from "./binary/or";
import type {TwingPowerNode} from "./binary/power";
import type {TwingRangeNode} from "./binary/range";
import type {TwingStartsWithNode} from "./binary/starts-with";
import type {TwingSubtractNode} from "./binary/subtract";
import {createBaseExpressionNode} from "../expression";
import type {TwingSpaceshipNode} from "./binary/spaceship";
import type {TwingHasEveryNode} from "./binary/has-every";
import type {TwingHasSomeNode} from "./binary/has-some";
import type {TwingXorNode} from "./binary/xor";
import type {TwingAssignNode} from "./binary/assign";

export type TwingBinaryNode =
    | TwingAddNode
    | TwingAndNode
    | TwingBitwiseAndNode
    | TwingBitwiseOrNode
    | TwingBitwiseXorNode
    | TwingConcatenateNode
    | TwingDivideNode
    | TwingEndsWithNode
    | TwingHasEveryNode
    | TwingHasSomeNode
    | TwingIsEqualToNode
    | TwingDivideAndFloorNode
    | TwingIsGreaterThanNode
    | TwingIsGreaterThanOrEqualToNode
    | TwingIsInNode
    | TwingIsLessThanNode
    | TwingIsLessThanOrEqualToNode
    | TwingMatchesNode
    | TwingModuloNode
    | TwingMultiplyNode
    | TwingIsNotEqualToNode
    | TwingIsNotStrictlyEqualToNode
    | TwingIsNotInNode
    | TwingIsStrictlyEqualToNode
    | TwingOrNode
    | TwingPowerNode
    | TwingRangeNode
    | TwingSpaceshipNode
    | TwingStartsWithNode
    | TwingSubtractNode
    | TwingXorNode
    | TwingAssignNode
    ;

export interface TwingBaseBinaryNode<Type extends string> extends TwingBaseExpressionNode<Type, TwingBaseExpressionNodeAttributes, {
    left: TwingBaseExpressionNode;
    right: TwingBaseExpressionNode;
}> {

}

export const createBaseBinaryNode = <Type extends string>(
    type: Type,
    operands: [TwingBaseExpressionNode, TwingBaseExpressionNode],
    line: number,
    column: number
): TwingBaseBinaryNode<Type> => {
    const baseNode = createBaseExpressionNode(type, {}, {
        left: operands[0],
        right: operands[1]
    }, line, column);

    return {
        ...baseNode
    }
};

export const createBinaryNodeFactory = <InstanceType extends TwingBaseBinaryNode<any>>(
    type: TwingNodeType<InstanceType>,
) => {
    const factory = (
        operands: [TwingBaseExpressionNode, TwingBaseExpressionNode],
        line: number,
        column: number
    ): InstanceType => {
        const baseNode = createBaseBinaryNode(type, operands, line, column);

        return {
            ...baseNode,
        } as InstanceType;
    };

    return factory;
};
