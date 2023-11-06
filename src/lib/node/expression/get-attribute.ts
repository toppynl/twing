import {
    BaseExpressionNode,
    BaseExpressionNodeAttributes,
    createBaseExpressionNode
} from "../expression";

export type GetAttributeCallType = "any" | "array" | "method";

export type GetAttributeNodeAttributes = BaseExpressionNodeAttributes & {
    type: GetAttributeCallType;
};

export interface GetAttributeNode extends BaseExpressionNode<"get_attribute", GetAttributeNodeAttributes, {
    target: BaseExpressionNode;
    attribute: BaseExpressionNode;
    arguments: BaseExpressionNode;
}> {
}

export const createGetAttributeNode = (
    target: BaseExpressionNode,
    attribute: BaseExpressionNode,
    methodArguments: BaseExpressionNode,
    type: GetAttributeCallType,
    line: number,
    column: number
): GetAttributeNode => {
    const baseNode = createBaseExpressionNode("get_attribute", {
        type
    }, {
        target,
        attribute,
        arguments: methodArguments
    }, line, column);

    const node: GetAttributeNode = {
        ...baseNode,
        compile: (compiler, flags) => {
            const {environment, options: compilerOptions} = compiler;
            const {target, attribute, arguments: methodArguments} = node.children;
            const {type} = node.attributes;
            
            const optimizable = flags?.optimizable !== false; // will default to true
            const isDefinedTest = flags?.isDefinedTest === true; // will default to false
            const ignoreStrictCheck = flags?.ignoreStrictCheck === true; // will default to false

            // optimize array, hash and Map calls
            if (optimizable && (!compilerOptions.strictVariables || ignoreStrictCheck) && !isDefinedTest && (type === "array")) {
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
            
            compiler.subCompile(target, {
                ignoreStrictCheck,
                optimizable: target.is("get_attribute") ? optimizable : undefined
            });

            compiler.raw(', ').subCompile(attribute);
            compiler.raw(', ').subCompile(methodArguments);

            compiler
                .raw(', ').render(type)
                .raw(', ').render(flags?.isDefinedTest || false)
                .raw(', ').render(flags?.ignoreStrictCheck || false)
                .raw(', ').render(environment.isSandboxed())
                .raw(')');
        }
    };

    return node;
};
