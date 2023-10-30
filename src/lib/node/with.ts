import {BaseNode, BaseNodeAttributes, createBaseNode, Node} from "../node";

export type WithNodeAttributes = BaseNodeAttributes & {
    only: boolean;
};

export type WithNodeChildren = {
    body: Node;
    variables?: Node;
};

export interface WithNode extends BaseNode<"with", WithNodeAttributes, WithNodeChildren> {
}

export const createWithNode = (
    body: Node,
    variables: Node | null,
    only: boolean,
    line: number,
    column: number,
    tag: string | null = null
): WithNode => {
    const children: WithNodeChildren = {
        body
    };
    
    if (variables) {
        children.variables = variables;
    }
    
    const baseNode = createBaseNode("with", {
        only
    }, children, line, column, tag);

    const node: WithNode = {
        ...baseNode,
        compile: (compiler) => {
            const {variables, body} = baseNode.children;
            const {only} = baseNode.attributes;

            if (variables) {
                compiler
                    .write('{\n')
                    .indent()
                    .write(`let tmp = `)
                    .subCompile(variables)
                    .raw(";\n")
                    .write(`if (typeof (tmp) !== 'object') {\n`)
                    .indent()
                    .write('throw runtime.createRuntimeError(\'Variables passed to the "with" tag must be a hash.\', ')
                    .render(baseNode.line)
                    .raw(", template.source);\n")
                    .outdent()
                    .write("}\n")
                ;

                if (only) {
                    compiler.write("context = new Map([['_parent', context]]);\n");
                } else {
                    compiler.write("context.set('_parent', context.clone());\n");
                }

                compiler
                    .write(`context = runtime.createContext(runtime.mergeGlobals(runtime.merge(context, runtime.convertToMap(tmp))));\n`)
                    .outdent()
                    .write('}\n\n')
            } else {
                compiler.write("context.set('_parent', context.clone());\n");
            }

            compiler
                .subCompile(body)
                .write("context = context.get('_parent');\n")
            ;
        }
    };
    
    return node;
};
