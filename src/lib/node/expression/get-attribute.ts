import {
    BaseExpressionNode,
    BaseExpressionNodeAttributes,
    createBaseExpressionNode,
    ExpressionNode
} from "../expression";

export type GetAttributeCallType = "any" | "array" | "method";

export type GetAttributeNodeAttributes = BaseExpressionNodeAttributes & {
    is_defined_test: boolean;
    type: GetAttributeCallType;
};

export interface GetAttributeNode extends BaseExpressionNode<"get_attribute", GetAttributeNodeAttributes, {
    target: ExpressionNode;
    attribute: ExpressionNode;
    arguments: ExpressionNode;
}> {
}

export const createGetAttributeNode = (
    target: ExpressionNode,
    attribute: ExpressionNode,
    methodArguments: ExpressionNode,
    type: GetAttributeCallType,
    line: number,
    column: number
): GetAttributeNode => {
    const baseNode = createBaseExpressionNode("get_attribute", {
        type,
        is_defined_test: false,
        ignore_strict_check: false,
        optimizable: true
    }, {
        target,
        attribute,
        arguments: methodArguments
    }, line, column);

    const node: GetAttributeNode = {
        ...baseNode,
        clone: () => {
            const {attributes, children, line, column} = node;
            const {target, attribute, arguments: methodArguments} = children;
            const {type} = attributes;

            return createGetAttributeNode(
                target.clone(),
                attribute.clone(),
                methodArguments.clone(),
                type,
                line,
                column
            )
        },
        compile: (compiler) => {
            const {environment, options} = compiler;
            const {target, attribute, arguments: methodArguments} = node.children;
            const {optimizable, ignore_strict_check, type, is_defined_test} = node.attributes;

            // optimize array, hash and Map calls
            if (optimizable && (!options.strictVariables || ignore_strict_check) && !is_defined_test && (type === "array")) {
                compiler
                    .raw('await (async () => {let object = ')
                    .subCompile(target)
                    .raw('; return runtime.get(object, ')
                    .subCompile(attribute)
                    .raw(');})()')
                ;

                return;
            }

            compiler.raw(`await template.traceableMethod(runtime.getAttribute, ${node.line}, template.source)(runtime, `);

            if (ignore_strict_check) {
                target.attributes.ignore_strict_check = true;
            }

            compiler.subCompile(target);

            compiler.raw(', ').subCompile(attribute);
            compiler.raw(', ').subCompile(methodArguments);

            compiler
                .raw(', ').render(type)
                .raw(', ').render(is_defined_test)
                .raw(', ').render(ignore_strict_check)
                .raw(', ').render(environment.isSandboxed())
                .raw(')');
        }
    };

    return node;
};
