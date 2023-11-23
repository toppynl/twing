import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";
import type {TwingNodeType} from "../../node";
import type {TwingNegativeNode} from "./unary/neg";
import type {TwingNotNode} from "./unary/not";
import type {TwingPositiveNode} from "./unary/pos";
import type {TwingTemplate} from "../../template";
import type {TwingTemplateAliases, TwingTemplateBlockMap} from "../../template";
import type {TwingContext} from "../../context";
import type {TwingOutputBuffer} from "../../output-buffer";
import {TwingSourceMapRuntime} from "../../source-map-runtime";

export type TwingUnaryNode =
    | TwingNegativeNode
    | TwingNotNode
    | TwingPositiveNode
    ;

export interface TwingBaseUnaryNode<Type extends string> extends TwingBaseExpressionNode<Type, TwingBaseExpressionNodeAttributes, {
    operand: TwingBaseExpressionNode;
}> {
}

export const createUnaryNodeFactory = <InstanceType extends TwingBaseUnaryNode<any>>(
    type: TwingNodeType<InstanceType>,
    definition: {
        execute: (
            baseNode: TwingBaseUnaryNode<TwingNodeType<InstanceType>>,
            template: TwingTemplate,
            context: TwingContext<any, any>,
            outputBuffer: TwingOutputBuffer,
            blocks: TwingTemplateBlockMap,
            aliases: TwingTemplateAliases,
            sourceMapRuntime?: TwingSourceMapRuntime
        ) => Promise<any>;
    }
) => {
    const factory = (
        operand: TwingBaseExpressionNode,
        line: number,
        column: number
    ): InstanceType => {
        const baseNode = createBaseUnaryNode(type, operand, line, column);

        return {
            ...baseNode,
            execute: (...args) => {
                return definition.execute(baseNode, ...args);
            }
        } as InstanceType;
    };

    return factory;
};

export const createBaseUnaryNode = <Type extends string>(
    type: Type,
    operand: TwingBaseExpressionNode,
    line: number,
    column: number
): TwingBaseUnaryNode<Type> => {
    const baseNode = createBaseExpressionNode(type, {}, {
        operand
    }, line, column);

    return {
        ...baseNode
    };
};
