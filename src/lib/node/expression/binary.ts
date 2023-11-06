import type {BaseExpressionNode, BaseExpressionNodeAttributes} from "../expression";
import type {TwingCompiler} from "../../compiler";
import type {Node, NodeType} from "../../node";
import type {AddNode} from "./binary/add";
import type {AndNode} from "./binary/and";
import type {BitwiseAndNode} from "./binary/bitwise-and";
import type {BitwiseOrNode} from "./binary/bitwise-or";
import type {ConcatNode} from "./binary/concat";
import type {EndsWithNode} from "./binary/ends-with";
import type {GreaterThanNode} from "./binary/greater";
import type {GreaterThanOrEqualToNode} from "./binary/greater-equal";
import type {BitwiseXorNode} from "./binary/bitwise-xor";
import type {DivNode} from "./binary/div";
import type {EqualNode} from "./binary/equal";
import type {FloorDivNode} from "./binary/floor-div";
import type {InNode} from "./binary/in";
import type {LessThanNode} from "./binary/less";
import type {LessThanOrEqualToNode} from "./binary/less-equal";
import type {MatchesNode} from "./binary/matches";
import type {ModuloNode} from "./binary/mod";
import type {MultiplyNode} from "./binary/mul";
import type {NotEqualToNode} from "./binary/not-equal";
import type {NotInNode} from "./binary/not-in";
import type {OrNode} from "./binary/or";
import type {PowerNode} from "./binary/power";
import type {RangeNode} from "./binary/range";
import type {StartsWithNode} from "./binary/starts-with";
import type {SubtractNode} from "./binary/sub";
import {createBaseExpressionNode} from "../expression";

export type BinaryNode =
    | AddNode
    | AndNode
    | BitwiseAndNode
    | BitwiseOrNode
    | BitwiseXorNode
    | ConcatNode
    | DivNode
    | EndsWithNode
    | EqualNode
    | FloorDivNode
    | GreaterThanNode
    | GreaterThanOrEqualToNode
    | InNode
    | LessThanNode
    | LessThanOrEqualToNode
    | MatchesNode
    | ModuloNode
    | MultiplyNode
    | NotEqualToNode
    | NotInNode
    | OrNode
    | PowerNode
    | RangeNode
    | StartsWithNode
    | SubtractNode
    ;

export interface BaseBinaryNode<Type extends string> extends BaseExpressionNode<Type, BaseExpressionNodeAttributes, {
    left: Node;
    right: Node;
}> {
    compileLeftOperand: (compiler: TwingCompiler) => void;
    compileRightOperand: (compiler: TwingCompiler) => void;
}

export const createBaseBinaryNode = <Type extends string>(
    type: Type,
    operator: string | null,
    operands: [BaseExpressionNode, BaseExpressionNode],
    line: number,
    column: number
): BaseBinaryNode<Type> => {
    const baseNode = createBaseExpressionNode(type, {}, {
        left: operands[0],
        right: operands[1]
    }, line, column);

    const compileLeftOperand: BaseBinaryNode<Type>["compileLeftOperand"] = (compiler) => {
        compiler
            .raw('(')
            .subCompile(baseNode.children.left)
            .raw(' ')
        ;
    }

    const compileRightOperand: BaseBinaryNode<Type>["compileRightOperand"] = (compiler) => {
        compiler
            .raw(' ')
            .subCompile(baseNode.children.right)
            .raw(')')
        ;
    }

    return {
        ...baseNode,
        compileLeftOperand,
        compileRightOperand,
        compile: (compiler) => {
            compileLeftOperand(compiler);
            compiler.raw(operator);
            compileRightOperand(compiler);
        }
    }
};

export const createBinaryNodeFactory = <InstanceType extends BaseBinaryNode<any>>(
    type: NodeType<InstanceType>,
    operator: string | null,
    definition?: {
        compile?: (compiler: TwingCompiler, baseNode: BaseBinaryNode<NodeType<InstanceType>>) => void
    }
) => {
    const factory = (
        operands: [BaseExpressionNode, BaseExpressionNode],
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
