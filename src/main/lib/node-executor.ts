import type {TwingBaseNode} from "./node";
import type {TwingExecutionContext} from "./execution-context";
import {executeBinaryNode, executeBinaryNodeSynchronously} from "./node-executor/expression/binary";
import {executeTemplateNode, executeTemplateNodeSynchronously} from "./node-executor/template";
import {executePrintNode, executePrintNodeSynchronously} from "./node-executor/print";
import {executeTextNode, executeTextNodeSynchronously} from "./node-executor/text";
import {executeCallNode, executeCallNodeSynchronously} from "./node-executor/expression/call";
import {executeMethodCall, executeMethodCallSynchronously} from "./node-executor/expression/method-call";
import {executeAssignmentNode, executeAssignmentNodeSynchronously} from "./node-executor/expression/assignment";
import {executeImportNode, executeImportNodeSynchronously} from "./node-executor/import";
import {executeParentFunction, executeParentFunctionSynchronously} from "./node-executor/expression/parent-function";
import {executeBlockFunction, executeSynchronousBlockFunction} from "./node-executor/expression/block-function";
import {executeBlockReferenceNode, executeBlockReferenceNodeSynchronously} from "./node-executor/block-reference";
import {executeUnaryNode, executeUnaryNodeSynchronously} from "./node-executor/expression/unary";
import {executeArrayNode, executeArrayNodeSynchronously} from "./node-executor/expression/array";
import {executeHashNode, executeHashNodeSynchronously} from "./node-executor/expression/hash";
import {
    executeAttributeAccessorNode,
    executeAttributeAccessorNodeSynchronously
} from "./node-executor/expression/attribute-accessor";
import {executeNameNode, executeNameNodeSynchronously} from "./node-executor/expression/name";
import {executeSetNode, executeSetNodeSynchronously} from "./node-executor/set";
import {executeIfNode, executeIfNodeSynchronously} from "./node-executor/if";
import {executeForNode, executeForNodeSynchronously} from "./node-executor/for";
import {executeForLoopNode, executeForLoopNodeSynchronously} from "./node-executor/for-loop";
import {executeCheckToStringNode, executeCheckToStringNodeSynchronously} from "./node-executor/check-to-string";
import {executeConditionalNode, executeConditionalNodeSynchronously} from "./node-executor/expression/conditional";
import {executeEmbedNode, executeEmbedNodeSynchronously} from "./node-executor/include/embed";
import {executeIncludeNode, executeIncludeNodeSynchronously} from "./node-executor/include/include";
import {executeWithNode, executeWithNodeSynchronously} from "./node-executor/with";
import {executeSpacelessNode, executeSpacelessNodeSynchronously} from "./node-executor/spaceless";
import {executeApplyNode, executeApplyNodeSynchronously} from "./node-executor/apply";
import {executeEscapeNode, executeEscapeNodeSynchronously} from "./node-executor/expression/escape";
import {
    executeArrowFunctionNode,
    executeArrowFunctionNodeSynchronously
} from "./node-executor/expression/arrow-function";
import {executeSandboxNode, executeSandboxNodeSynchronously} from "./node-executor/sandbox";
import {executeDoNode, executeDoNodeSynchronously} from "./node-executor/do";
import {executeDeprecatedNode, executeDeprecatedNodeSynchronously} from "./node-executor/deprecated";
import {executeSpreadNode, executeSpreadNodeSynchronously} from "./node-executor/expression/spread";
import {executeCheckSecurityNode, executeCheckSecurityNodeSynchronously} from "./node-executor/check-security";
import {executeFlushNode, executeFlushNodeSynchronously} from "./node-executor/flush";
import {createRuntimeError} from "./error/runtime";
import {executeConstantNode, executeConstantNodeSynchronously} from "./node-executor/constant";
import {executeLineNode, executeLineNodeSynchronously} from "./node-executor/line";
import {executeCommentNode, executeCommentNodeSynchronously} from "./node-executor/comment";
import {executeBaseNode, executeBaseNodeSynchronously} from "./node-executor/base";
import {TwingSynchronousExecutionContext} from "./execution-context";

export type TwingNodeExecutor<Node extends TwingBaseNode = TwingBaseNode> = (
    node: Node,
    executionContext: TwingExecutionContext
) => Promise<any>;

export type TwingSynchronousNodeExecutor<Node extends TwingBaseNode = TwingBaseNode> = (
    node: Node,
    executionContext: TwingSynchronousExecutionContext
) => any;

const binaryNodeTypes = ["add", "and", "bitwise_and", "bitwise_or", "bitwise_xor", "concatenate", "divide", "divide_and_floor", "ends_with", "has_every", "has_some", "is_equal_to", "is_greater_than", "is_greater_than_or_equal_to", "is_in", "is_less_than", "is_less_than_or_equal_to", "is_not_equal_to", "is_not_in", "matches", "modulo", "multiply", "or", "power", "range", "spaceship", "starts_with", "subtract"];

const isABinaryNode = (node: TwingBaseNode): boolean => {
    return binaryNodeTypes.includes(node.type);
};

const unaryNodeTypes = ["negative", "not", "positive"];

const isAUnaryNode = (node: TwingBaseNode): boolean => {
    return unaryNodeTypes.includes(node.type);
};

const callNodeTypes = ["filter", "function", "test"];

const isACallNode = (node: TwingBaseNode): boolean => {
    return callNodeTypes.includes(node.type);
};

/**
 * Execute the passed node against the passed execution context.
 *
 * @param node The node to execute
 * @param executionContext The context the node is executed against
 */
export const executeNode: TwingNodeExecutor = (node, executionContext) => {
    let executor: TwingNodeExecutor<any>;

    if (isABinaryNode(node)) {
        executor = executeBinaryNode;
    }
    else if (isACallNode(node)) {
        executor = executeCallNode;
    }
    else if (isAUnaryNode(node)) {
        executor = executeUnaryNode;
    }
    else if (node.type === null) {
        executor = executeBaseNode;
    }
    else if (node.type === "apply") {
        executor = executeApplyNode;
    }
    else if (node.type === "array") {
        executor = executeArrayNode;
    }
    else if (node.type === "arrow_function") {
        executor = executeArrowFunctionNode;
    }
    else if (node.type === "assignment") {
        executor = executeAssignmentNode;
    }
    else if (node.type === "attribute_accessor") {
        executor = executeAttributeAccessorNode;
    }
    else if (node.type === "block_function") {
        executor = executeBlockFunction;
    }
    else if (node.type === "block_reference") {
        executor = executeBlockReferenceNode;
    }
    else if (node.type === "check_security") {
        executor = executeCheckSecurityNode;
    }
    else if (node.type === "check_to_string") {
        executor = executeCheckToStringNode;
    }
    else if (node.type === "comment") {
        executor = executeCommentNode;
    }
    else if (node.type === "conditional") {
        executor = executeConditionalNode;
    }
    else if (node.type === "constant") {
        executor = executeConstantNode;
    }
    else if (node.type === "deprecated") {
        executor = executeDeprecatedNode;
    }
    else if (node.type === "do") {
        executor = executeDoNode;
    }
    else if (node.type === "embed") {
        executor = executeEmbedNode;
    }
    else if (node.type === "escape") {
        executor = executeEscapeNode;
    }
    else if (node.type === "flush") {
        executor = executeFlushNode;
    }
    else if (node.type === "for") {
        executor = executeForNode;
    }
    else if (node.type === "for_loop") {
        executor = executeForLoopNode;
    }
    else if (node.type === "hash") {
        executor = executeHashNode;
    }
    else if (node.type === "if") {
        executor = executeIfNode;
    }
    else if (node.type === "import") {
        executor = executeImportNode;
    }
    else if (node.type === "include") {
        executor = executeIncludeNode;
    }
    else if (node.type === "line") {
        executor = executeLineNode;
    }
    else if (node.type === "method_call") {
        executor = executeMethodCall;
    }
    else if (node.type === "name") {
        executor = executeNameNode;
    }
    else if (node.type === "nullish_coalescing") {
        executor = executeConditionalNode;
    }
    else if (node.type === "parent_function") {
        executor = executeParentFunction;
    }
    else if (node.type === "print") {
        executor = executePrintNode;
    }
    else if (node.type === "sandbox") {
        executor = executeSandboxNode;
    }
    else if (node.type === "set") {
        executor = executeSetNode;
    }
    else if (node.type === "spaceless") {
        executor = executeSpacelessNode;
    }
    else if (node.type === "spread") {
        executor = executeSpreadNode;
    }
    else if (node.type === "template") {
        executor = executeTemplateNode;
    }
    else if (node.type === "text") {
        executor = executeTextNode;
    }
    else if (node.type === "verbatim") {
        executor = executeTextNode;
    }
    else if (node.type === "with") {
        executor = executeWithNode;
    }
    else {
        const customExecute = (node as any).customExecute as TwingNodeExecutor | undefined;

        if (typeof customExecute === "function") {
            return customExecute(node, executionContext);
        }

        return Promise.reject(createRuntimeError(`Unrecognized node of type "${node.type}"`, node, executionContext.template.source));
    }

    return executor(node, executionContext);
};

export const executeNodeSynchronously: TwingSynchronousNodeExecutor = (node, executionContext) => {
    let executor: TwingSynchronousNodeExecutor<any>;

    if (isABinaryNode(node)) {
        executor = executeBinaryNodeSynchronously;
    }
    else if (isACallNode(node)) {
        executor = executeCallNodeSynchronously;
    }
    else if (isAUnaryNode(node)) {
        executor = executeUnaryNodeSynchronously;
    }
    else if (node.type === null) {
        executor = executeBaseNodeSynchronously;
    }
    else if (node.type === "apply") {
        executor = executeApplyNodeSynchronously;
    }
    else if (node.type === "array") {
        executor = executeArrayNodeSynchronously;
    }
    else if (node.type === "arrow_function") {
        executor = executeArrowFunctionNodeSynchronously;
    }
    else if (node.type === "assignment") {
        executor = executeAssignmentNodeSynchronously;
    }
    else if (node.type === "attribute_accessor") {
        executor = executeAttributeAccessorNodeSynchronously;
    }
    else if (node.type === "block_function") {
        executor = executeSynchronousBlockFunction;
    }
    else if (node.type === "block_reference") {
        executor = executeBlockReferenceNodeSynchronously;
    }
    else if (node.type === "check_security") {
        executor = executeCheckSecurityNodeSynchronously;
    }
    else if (node.type === "check_to_string") {
        executor = executeCheckToStringNodeSynchronously;
    }
    else if (node.type === "comment") {
        executor = executeCommentNodeSynchronously;
    }
    else if (node.type === "conditional") {
        executor = executeConditionalNodeSynchronously;
    }
    else if (node.type === "constant") {
        executor = executeConstantNodeSynchronously;
    }
    else if (node.type === "deprecated") {
        executor = executeDeprecatedNodeSynchronously;
    }
    else if (node.type === "do") {
        executor = executeDoNodeSynchronously;
    }
    else if (node.type === "embed") {
        executor = executeEmbedNodeSynchronously;
    }
    else if (node.type === "escape") {
        executor = executeEscapeNodeSynchronously;
    }
    else if (node.type === "flush") {
        executor = executeFlushNodeSynchronously;
    }
    else if (node.type === "for") {
        executor = executeForNodeSynchronously;
    }
    else if (node.type === "for_loop") {
        executor = executeForLoopNodeSynchronously;
    }
    else if (node.type === "hash") {
        executor = executeHashNodeSynchronously;
    }
    else if (node.type === "if") {
        executor = executeIfNodeSynchronously;
    }
    else if (node.type === "import") {
        executor = executeImportNodeSynchronously;
    }
    else if (node.type === "include") {
        executor = executeIncludeNodeSynchronously;
    }
    else if (node.type === "line") {
        executor = executeLineNodeSynchronously;
    }
    else if (node.type === "method_call") {
        executor = executeMethodCallSynchronously;
    }
    else if (node.type === "name") {
        executor = executeNameNodeSynchronously;
    }
    else if (node.type === "nullish_coalescing") {
        executor = executeConditionalNodeSynchronously;
    }
    else if (node.type === "parent_function") {
        executor = executeParentFunctionSynchronously;
    }
    else if (node.type === "print") {
        executor = executePrintNodeSynchronously;
    }
    else if (node.type === "sandbox") {
        executor = executeSandboxNodeSynchronously;
    }
    else if (node.type === "set") {
        executor = executeSetNodeSynchronously;
    }
    else if (node.type === "spaceless") {
        executor = executeSpacelessNodeSynchronously;
    }
    else if (node.type === "spread") {
        executor = executeSpreadNodeSynchronously;
    }
    else if (node.type === "template") {
        executor = executeTemplateNodeSynchronously;
    }
    else if (node.type === "text") {
        executor = executeTextNodeSynchronously;
    }
    else if (node.type === "verbatim") {
        executor = executeTextNodeSynchronously;
    }
    else if (node.type === "with") {
        executor = executeWithNodeSynchronously;
    }
    else {
        const customExecute = (node as any).customExecuteSynchronously as TwingSynchronousNodeExecutor | undefined;

        if (typeof customExecute === "function") {
            return customExecute(node, executionContext);
        }

        throw createRuntimeError(`Unrecognized node of type "${node.type}"`, node, executionContext.template.source);
    }

    return executor(node, executionContext);
};
