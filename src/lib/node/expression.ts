import {TwingBaseNode, createBaseNode, TwingBaseNodeAttributes, TwingBaseNodeChildren} from "../node";
import type {TwingConstantNode} from "./expression/constant";
import type {TwingNameNode} from "./expression/name";
import type {TwingAssignmentNode} from "./expression/assignment";
import type {TwingArrayNode} from "./expression/array";
import type {TwingHashNode} from "./expression/hash";
import type {TwingArrowFunctionNode} from "./expression/arrow-function";
import type {TwingBinaryNode} from "./expression/binary";
import type {TwingUnaryNode} from "./expression/unary";
import type {TwingFilterNode} from "./expression/call/filter";
import type {TwingConditionalNode} from "./expression/conditional";
import type {TwingCallNode} from "./expression/call";
import type {TwingBlockFunctionNode} from "./expression/block-function";
import type {TwingAttributeAccessorNode} from "./expression/attribute-accessor";
import type {TwingMethodCallNode} from "./expression/method-call";
import type {TwingNullishCoalescingNode} from "./expression/nullish-coalescing";
import type {TwingParentFunctionNode} from "./expression/parent-function";
import type {ArgumentsNode} from "./expression/arguments";

export type TwingExpressionNode =
    | ArgumentsNode
    | TwingArrayNode
    | TwingArrowFunctionNode
    | TwingAssignmentNode
    | TwingBinaryNode
    | TwingBlockFunctionNode
    | TwingCallNode
    | TwingConditionalNode
    | TwingConstantNode
    | TwingFilterNode
    | TwingAttributeAccessorNode
    | TwingHashNode
    | TwingMethodCallNode
    | TwingNameNode
    | TwingNullishCoalescingNode
    | TwingParentFunctionNode
    | TwingUnaryNode
    ;

export type TwingBaseExpressionNodeAttributes = TwingBaseNodeAttributes;

// todo: this is a base node, no need for a type
export type TwingBaseExpressionNode<
    Type extends string = any,
    AdditionalAttributes extends TwingBaseExpressionNodeAttributes = TwingBaseExpressionNodeAttributes,
    AdditionalChildren extends TwingBaseNodeChildren = TwingBaseNodeChildren,
> = TwingBaseNode<Type, TwingBaseExpressionNodeAttributes & AdditionalAttributes, TwingBaseNodeChildren & AdditionalChildren>;

export const createBaseExpressionNode = createBaseNode;
