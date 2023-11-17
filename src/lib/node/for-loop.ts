import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";

export type TwingForLoopNodeAttributes = TwingBaseNodeAttributes & {
    hasAnIf: boolean;
    hasAnElse: boolean;
};

export interface TwingForLoopNode extends TwingBaseNode<"for_loop", TwingForLoopNodeAttributes> {
}

export const createForLoopNode = (
    line: number,
    column: number,
    tag: string
): TwingForLoopNode => {
    const baseNode = createBaseNode("for_loop", {
        hasAnIf: false,
        hasAnElse: false
    }, {}, line, column, tag);

    const node: TwingForLoopNode = {
        ...baseNode,
        compile: (compiler) => {
            const {hasAnElse, hasAnIf} = node.attributes;

            if (hasAnElse) {
                compiler.write("context.set('_iterated',  true);\n");
            }

            compiler
                .write("(() => {\n")
                
                .write("let loop = context.get('loop');\n")
                .write("loop.set('index0', loop.get('index0') + 1);\n")
                .write("loop.set('index', loop.get('index') + 1);\n")
                .write("loop.set('first', false);\n")
            ;

            if (!hasAnIf) {
                compiler
                    .write("if (loop.has('length')) {\n")
                    
                    .write("loop.set('revindex0', loop.get('revindex0') - 1);\n")
                    .write("loop.set('revindex', loop.get('revindex') - 1);\n")
                    .write("loop.set('last', loop.get('revindex0') === 0);\n")
                    
                    .write("}\n")
                ;
            }

            compiler
                
                .write("})();\n")
            ;
        }
    };

    return node;
};
