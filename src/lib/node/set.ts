import {BaseNode, BaseNodeAttributes, createBaseNode, getChildrenCount} from "../node";
import {createConstantNode} from "./expression/constant";
import {textNodeType} from "./text";

export type SetNodeAttributes = BaseNodeAttributes & {
    capture: boolean;
    safe: boolean;
};

export interface SetNode extends BaseNode<"set", SetNodeAttributes, {
    names: BaseNode;
    values: BaseNode;
}> {
}

export const createSetNode = (
    capture: boolean,
    names: SetNode["children"]["names"],
    values: SetNode["children"]["values"],
    line: number,
    column: number,
    tag: string
): SetNode => {
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
                        compiler.raw(', ');
                    }

                    compiler
                        .subCompile(node)
                    ;

                    index++;
                }

                compiler.raw(']');
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
                        .raw(" = (() => {let tmp = outputBuffer.getAndClean(); return tmp === '' ? '' : runtime.createMarkup(tmp, runtime.getCharset());})()")
                    ;
                }
            }

            if (!capture) {
                compiler.raw(' = ');

                if (getChildrenCount(values) > 1) {
                    compiler.raw('[');

                    let index = 0;

                    for (const [, value] of Object.entries(values.children)) {
                        if (index > 0) {
                            compiler.raw(', ');
                        }

                        compiler
                            .subCompile(value)
                        ;

                        index++;
                    }

                    compiler.raw(']');
                } else {
                    if (safe) {
                        compiler
                            .raw("await (async () => {let tmp = ")
                            .subCompile(values)
                            .raw("; return tmp === '' ? '' : runtime.createMarkup(tmp, runtime.getCharset());})()")
                        ;
                    } else {
                        compiler.subCompile(values);
                    }
                }
            }

            compiler.raw(';\n');
        },
        isACaptureNode: true
    };
};
