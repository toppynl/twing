import type {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes} from "../expression";
import type {TwingCompiler} from "../../compiler";
import type {TwingNode, TwingNodeType} from "../../node";
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
import type {TwingIsNotInNode} from "./binary/is-not-in";
import type {TwingOrNode} from "./binary/or";
import type {TwingPowerNode} from "./binary/power";
import type {TwingRangeNode} from "./binary/range";
import type {TwingStartsWithNode} from "./binary/starts-with";
import type {TwingSubtractNode} from "./binary/subtract";
import {createBaseExpressionNode} from "../expression";

export type TwingBinaryNode =
    | TwingAddNode
    | TwingAndNode
    | TwingBitwiseAndNode
    | TwingBitwiseOrNode
    | TwingBitwiseXorNode
    | TwingConcatenateNode
    | TwingDivideNode
    | TwingEndsWithNode
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
    | TwingIsNotInNode
    | TwingOrNode
    | TwingPowerNode
    | TwingRangeNode
    | TwingStartsWithNode
    | TwingSubtractNode
    ;

export interface TwingBaseBinaryNode<Type extends string> extends TwingBaseExpressionNode<Type, TwingBaseExpressionNodeAttributes, {
    left: TwingNode;
    right: TwingNode;
}> {
    compileLeftOperand: (compiler: TwingCompiler) => void;
    compileRightOperand: (compiler: TwingCompiler) => void;
}

export const createBaseBinaryNode = <Type extends string>(
    type: Type,
    operator: string | null,
    operands: [TwingBaseExpressionNode, TwingBaseExpressionNode],
    line: number,
    column: number
): TwingBaseBinaryNode<Type> => {
    const baseNode = createBaseExpressionNode(type, {}, {
        left: operands[0],
        right: operands[1]
    }, line, column);

    const compileLeftOperand: TwingBaseBinaryNode<Type>["compileLeftOperand"] = (compiler) => {
        compiler
            .write('(')
            .subCompile(baseNode.children.left)
            .write(' ')
        ;
    }

    const compileRightOperand: TwingBaseBinaryNode<Type>["compileRightOperand"] = (compiler) => {
        compiler
            .write(' ')
            .subCompile(baseNode.children.right)
            .write(')')
        ;
    }

    return {
        ...baseNode,
        compileLeftOperand,
        compileRightOperand,
        compile: (compiler) => {
            compileLeftOperand(compiler);
            compiler.write(operator);
            compileRightOperand(compiler);
        }
    }
};

export const createBinaryNodeFactory = <InstanceType extends TwingBaseBinaryNode<any>>(
    type: TwingNodeType<InstanceType>,
    operator: string | null,
    definition?: {
        compile?: (compiler: TwingCompiler, baseNode: TwingBaseBinaryNode<TwingNodeType<InstanceType>>) => void
    }
) => {
    const factory = (
        operands: [TwingBaseExpressionNode, TwingBaseExpressionNode],
        line: number,
        column: number
    ): InstanceType => {
        const baseNode = createBaseBinaryNode(type, operator, operands, line, column);

        return {
            ...baseNode,
            compile: (compiler) => {
                if (definition?.compile) {
                    return definition.compile(compiler, baseNode);
                } else {
                    return baseNode.compile(compiler);
                }
            }
        } as InstanceType;
    };

    return factory;
};
