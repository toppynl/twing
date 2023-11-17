import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, getChildrenCount} from "../node";
import {createConstantNode} from "./expression/constant";
import {textNodeType} from "./output/text";

export type SetNodeAttributes = TwingBaseNodeAttributes & {
    capture: boolean; // todo: rename
};

export interface TwingSetNode extends TwingBaseNode<"set", SetNodeAttributes, {
    names: TwingBaseNode;
    values: TwingBaseNode;
}> {
}

export const createSetNode = (
    capture: boolean,
    names: TwingSetNode["children"]["names"],
    values: TwingSetNode["children"]["values"],
    line: number,
    column: number,
    tag: string
): TwingSetNode => {
    const baseNode = createBaseNode("set", {
        capture,
        safe: false
    }, {
        names,
        values
    }, line, column, tag);

    /*
     * Optimizes the node when capture is used for a large block of text.
     *
     * {% set foo %}foo{% endset %} is compiled to $context['foo'] = new Twig_Markup("foo");
     */
    if (baseNode.attributes.capture) {
        baseNode.attributes.safe = true;

        const {values} = baseNode.children;

        if (values.is(textNodeType)) {
            baseNode.children.values = createConstantNode(values.attributes.data, values.line, values.column);
            baseNode.attributes.capture = false;
        }
    }

    return {
        ...baseNode,
        compile: (compiler) => {
            const {names, values} = baseNode.children;
            const {capture, safe} = baseNode.attributes;

            if (getChildrenCount(names) > 1) {
                compiler.write('[');

                let index = 0;

                for (const [, node] of Object.entries(names.children)) {
                    if (index > 0) {
                        compiler.write(', ');
                    }

                    compiler
                        .subCompile(node)
                    ;

                    index++;
                }

                compiler.write(']');
            } else {
                if (capture) {
                    compiler
                        .write("outputBuffer.start();\n")
                        .subCompile(values)
                    ;
                }

                compiler.subCompile(names); //, false

                if (capture) {
                    compiler
                        .write(" = (() => {\n")
                        
                        .write("let tmp = outputBuffer.getAndClean();\n")
                        .write("return tmp === '' ? '' : runtime.createMarkup(tmp, runtime.charset);\n")
                        
                        .write("})()")
                    ;
                }
            }

            if (!capture) {
                compiler.write(' = ');

                if (getChildrenCount(values) > 1) {
                    compiler.write('[');

                    let index = 0;

                    for (const [, value] of Object.entries(values.children)) {
                        if (index > 0) {
                            compiler.write(', ');
                        }

                        compiler
                            .subCompile(value)
                        ;

                        index++;
                    }

                    compiler.write(']');
                } else {
                    if (safe) {
                        compiler
                            .write("await (async () => {\n")
                            
                            .write("let tmp = ")
                            .subCompile(values)
                            .write(";\n")
                            .write("return tmp === '' ? '' : runtime.createMarkup(tmp, runtime.charset);\n")
                            
                            .write("})()")
                        ;
                    } else {
                        compiler.subCompile(values);
                    }
                }
            }

            compiler.write(';\n');
        },
        isACaptureNode: true
    };
};
