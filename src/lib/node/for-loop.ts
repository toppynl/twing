import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";

export type ForLoopNodeAttributes = BaseNodeAttributes & {
    with_loop: boolean;
    ifexpr: boolean;
    else: boolean;
};

export interface ForLoopNode extends BaseNode<"for_loop", ForLoopNodeAttributes> {
}

export const createForLoopNode = (
    line: number,
    column: number,
    tag: string | null = null
): ForLoopNode => {
    const baseNode = createBaseNode("for_loop", {
        with_loop: false,
        ifexpr: false,
        else: false
    }, {}, line, column, tag);

    const node: ForLoopNode = {
        ...baseNode,
        clone: () => createForLoopNode(line, column, tag),
        compile: (compiler) => {
            const {else: elseValue, with_loop, ifexpr} = node.attributes;

            if (elseValue) {
                compiler.write("context.set('_iterated',  true);\n");
            }

            if (with_loop) {
                compiler
                    .write("(() => {\n")
                    .indent()
                    .write("let loop = context.get('loop');\n")
                    .write("loop.set('index0', loop.get('index0') + 1);\n")
                    .write("loop.set('index', loop.get('index') + 1);\n")
                    .write("loop.set('first', false);\n")
                ;

                if (!ifexpr) {
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
        }
    };

    return node;
};
