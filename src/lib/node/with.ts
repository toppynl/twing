import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, TwingNode} from "../node";

export type TwingWithNodeAttributes = TwingBaseNodeAttributes & {
    only: boolean;
};

export type TwingWithNodeChildren = {
    body: TwingNode;
    variables?: TwingNode;
};

export interface TwingWithNode extends TwingBaseNode<"with", TwingWithNodeAttributes, TwingWithNodeChildren> {
}

export const createWithNode = (
    body: TwingNode,
    variables: TwingNode | null,
    only: boolean,
    line: number,
    column: number,
    tag: string
): TwingWithNode => {
    const children: TwingWithNodeChildren = {
        body
    };
    
    if (variables) {
        children.variables = variables;
    }
    
    const baseNode = createBaseNode("with", {
        only
    }, children, line, column, tag);

    const node: TwingWithNode = {
        ...baseNode,
        compile: (compiler) => {
            const {variables, body} = baseNode.children;
            const {only} = baseNode.attributes;

            if (variables) {
                compiler
                    .write('{\n')
                    
                    .write(`let tmp = `)
                    .subCompile(variables)
                    .write(";\n")
                    .write(`if (typeof (tmp) !== 'object') {\n`)
                    
                    .write('throw new runtime.Error(\'Variables passed to the "with" tag must be a hash.\', ')
                    .render(baseNode.line)
                    .write(", template.source);\n")
                    
                    .write("}\n")
                ;

                if (only) {
                    compiler.write("context = new Map([['_parent', context]]);\n");
                } else {
                    compiler.write("context.set('_parent', context.clone());\n");
                }

                compiler
                    .write(`context = runtime.createContext(runtime.mergeGlobals(runtime.merge(context, runtime.convertToMap(tmp))));\n`)
                    
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
