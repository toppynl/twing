import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";

export type ForLoopNodeAttributes = BaseNodeAttributes & {
    hasAnIf: boolean;
    hasAnElse: boolean;
};

export interface ForLoopNode extends BaseNode<"for_loop", ForLoopNodeAttributes> {
}

export const createForLoopNode = (
    line: number,
    column: number,
    tag: string
): ForLoopNode => {
    const baseNode = createBaseNode("for_loop", {
        hasAnIf: false,
        hasAnElse: false
    }, {}, line, column, tag);

    const node: ForLoopNode = {
        ...baseNode,
        compile: (compiler) => {
            const {hasAnElse, hasAnIf} = node.attributes;

            if (hasAnElse) {
                compiler.write("context.set('_iterated',  true);\n");
            }

            compiler
                .write("(() => {\n")
                .indent()
                .write("let loop = context.get('loop');\n")
                .write("loop.set('index0', loop.get('index0') + 1);\n")
                .write("loop.set('index', loop.get('index') + 1);\n")
                .write("loop.set('first', false);\n")
            ;

            if (!hasAnIf) {
                compiler
                    .write("if (loop.has('length')) {\n")
                    .indent()
                    .write("loop.set('revindex0', loop.get('revindex0') - 1);\n")
                    .write("loop.set('revindex', loop.get('revindex') - 1);\n")
                    .write("loop.set('last', loop.get('revindex0') === 0);\n")
                    .outdent()
                    .write("}\n")
                ;
            }

            compiler
                .outdent()
                .write("})();\n")
            ;
        }
    };

    return node;
};
