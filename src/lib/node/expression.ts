import {BaseNode, createBaseNode, BaseNodeAttributes, BaseNodeChildren} from "../node";
import type {ConstantNode} from "./expression/constant";
import type {NameNode} from "./expression/name";
import type {AssignNameNode} from "./expression/assign-name";
import type {ArrayNode} from "./expression/array";
import type {HashNode} from "./expression/hash";
import type {ArrowFunctionNode} from "./expression/arrow-function";
import type {BinaryNode} from "./expression/binary";
import type {UnaryNode} from "./expression/unary";
import type {FilterNode} from "./expression/call/filter";
import type {ConditionalNode} from "./expression/conditional";
import type {CallNode} from "./expression/call";
import type {BlockReferenceExpressionNode} from "./expression/block-reference";
import type {GetAttributeNode} from "./expression/get-attribute";
import type {MethodCallNode} from "./expression/method-call";
import type {NullishCoalescingNode} from "./expression/nullish-coalescing";
import type {ParentNode} from "./expression/parent";
import type {TemporaryNameNode} from "./expression/temp-name";
import type {ArgumentsNode} from "./expression/arguments";

export const expressionNodeType = "expression";

export type ExpressionNode =
    | ArgumentsNode
    | ArrayNode
    | ArrowFunctionNode
    | AssignNameNode
    | BinaryNode
    | BlockReferenceExpressionNode
    | CallNode
    | ConditionalNode
    | ConstantNode
    | FilterNode
    | GetAttributeNode
    | HashNode
    | MethodCallNode
    | NameNode
    | NullishCoalescingNode
    | ParentNode
    | TemporaryNameNode
    | UnaryNode
    ;

export type BaseExpressionNodeAttributes = BaseNodeAttributes & {
    optimizable?: boolean;
    ignore_strict_check?: boolean;
};

export type BaseExpressionNodeChildren = BaseNodeChildren;

export interface BaseExpressionNode<
    Type extends string,
    AdditionalAttributes extends BaseNodeAttributes = BaseNodeAttributes,
    AdditionalChildren extends BaseNodeChildren = BaseNodeChildren,
> extends BaseNode<Type, BaseExpressionNodeAttributes & AdditionalAttributes, BaseExpressionNodeChildren & AdditionalChildren> {
}

export const createBaseExpressionNode = <
    Type extends string,
    Attributes extends BaseExpressionNodeAttributes,
    Children extends BaseExpressionNodeChildren
>(
    type: Type,
    attributes: Attributes,
    children: Children,
    line: number,
    column: number,
    tag: string | null = null
): BaseExpressionNode<Type, Attributes, Children> => {
    const baseNode = createBaseNode(type, attributes, children, line, column, tag);

    const node: BaseExpressionNode<Type, Attributes, Children> = {
        ...baseNode,
        is: (type: string) => {
            return type === node.type || type === expressionNodeType;
        },
        clone: () => createBaseExpressionNode(type, attributes, children, line, column, tag)
    };

    return node;
};
