import type {TwingBaseNode} from "./node";
import type {TwingExecutionContext} from "./execution-context";
import {executeBinaryNode} from "./node-executor/expression/binary";
import {executeTemplateNode} from "./node-executor/template";
import {executePrintNode} from "./node-executor/print";
import {executeTextNode} from "./node-executor/text";
import {executeCallNode} from "./node-executor/expression/call";
import {executeMethodCall} from "./node-executor/expression/method-call";
import {executeAssignmentNode} from "./node-executor/expression/assignment";
import {executeImportNode} from "./node-executor/import";
import {executeParentFunction} from "./node-executor/expression/parent-function";
import {executeBlockFunction} from "./node-executor/expression/block-function";
import {executeBlockReferenceNode} from "./node-executor/block-reference";
import {executeUnaryNode} from "./node-executor/expression/unary";
import {executeArrayNode} from "./node-executor/expression/array";
import {executeHashNode} from "./node-executor/expression/hash";
import {executeAttributeAccessorNode} from "./node-executor/expression/attribute-accessor";
import {executeNameNode} from "./node-executor/expression/name";
import {executeSetNode} from "./node-executor/set";
import {executeIfNode} from "./node-executor/if";
import {executeForNode} from "./node-executor/for";
import {executeForLoopNode} from "./node-executor/for-loop";
import {executeCheckToStringNode} from "./node-executor/check-to-string";
import {executeConditionalNode} from "./node-executor/expression/conditional";
import {executeEmbedNode} from "./node-executor/include/embed";
import {executeIncludeNode} from "./node-executor/include/include";
import {executeWithNode} from "./node-executor/with";
import {executeSpacelessNode} from "./node-executor/spaceless";
import {executeApplyNode} from "./node-executor/apply";
import {executeEscapeNode} from "./node-executor/expression/escape";
import {executeArrowFunctionNode} from "./node-executor/expression/arrow-function";
import {executeSandboxNode} from "./node-executor/sandbox";
import {executeDoNode} from "./node-executor/do";
import {executeDeprecatedNode} from "./node-executor/deprecated";
import {executeSpreadNode} from "./node-executor/expression/spread";
import {executeCheckSecurityNode} from "./node-executor/check-security";
import {executeFlushNode} from "./node-executor/flush";
import {createRuntimeError} from "./error/runtime";
import {executeConstantNode} from "./node-executor/constant";
import {executeLineNode} from "./node-executor/line";
import {executeCommentNode} from "./node-executor/comment";
import {executeBaseNode} from "./node-executor/base";

export type TwingNodeExecutor<Node extends TwingBaseNode = TwingBaseNode> = (
    node: Node,
    executionContext: TwingExecutionContext
) => Promise<any>;

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
        return Promise.reject(createRuntimeError(`Unrecognized node of type "${node.type}"`, node, executionContext.template.source));
    }

    return executor(node, executionContext);
};
