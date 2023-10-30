import {BaseNode, BaseNodeAttributes, createBaseNode, Node} from "../node";

export type CheckSecurityNodeAttributes = BaseNodeAttributes & {
    usedFilters: Map<string, Node | string>;
    usedTags: Map<string, Node | string>;
    usedFunctions: Map<string, Node | string>;
};

export interface CheckSecurityNode extends BaseNode<"check_security", CheckSecurityNodeAttributes> {
}

export const createCheckSecurityNode = (
    usedFilters: Map<string, Node | string>,
    usedTags: Map<string, Node | string>,
    usedFunctions: Map<string, Node | string>,
    line: number,
    column: number
): CheckSecurityNode => {
    const baseNode = createBaseNode("check_security", {
        usedFilters,
        usedTags,
        usedFunctions
    }, {}, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            const {usedTags, usedFunctions, usedFilters} = baseNode.attributes;

            const tags = new Map();

            for (const [name, node] of usedTags) {
                if (typeof node === 'string') {
                    tags.set(node, null);
                } else {
                    tags.set(name, node.line);
                }
            }

            let filters = new Map();

            for (const [name, node] of usedFilters) {
                if (typeof node === 'string') {
                    filters.set(node, null);
                } else {
                    filters.set(name, node.line);
                }
            }

            let functions = new Map();

            for (const [name, node] of usedFunctions) {
                if (typeof node === 'string') {
                    functions.set(node, null);
                } else {
                    functions.set(name, node.line);
                }
            }

            compiler
                .write('let tags = ').render(tags).raw(";\n")
                .write('let filters = ').render(filters).raw(";\n")
                .write('let functions = ').render(functions).raw(";\n\n")
                .write("try {\n")
                .indent()
                .write("runtime.checkSecurity(\n")
                .indent()
                .write(!tags.size ? "[],\n" : "['" + [...tags.keys()].join('\', \'') + "'],\n")
                .write(!filters.size ? "[],\n" : "['" + [...filters.keys()].join('\', \'') + "'],\n")
                .write(!functions.size ? "[]\n" : "['" + [...functions.keys()].join('\', \'') + "']\n")
                .outdent()
                .write(");\n")
                .outdent()
                .write("}\n")
                .write("catch (e) {\n")
                .indent()
                .write("if (e.name === 'TwingSandboxSecurityError') {\n")
                .indent()
                .write("e.setSourceContext(template.source);\n\n")
                .write("if ((typeof e.getTagName === 'function') && tags.has(e.getTagName())) {\n")
                .indent()
                .write("e.setTemplateLine(tags.get(e.getTagName()));\n")
                .outdent()
                .write("}\n")
                .write("else if ((typeof e.getFilterName === 'function') && filters.has(e.getFilterName())) {\n")
                .indent()
                .write("e.setTemplateLine(filters.get(e.getFilterName()));\n")
                .outdent()
                .write("}\n")
                .write("else if ((typeof e.getFunctionName === 'function') && functions.has(e.getFunctionName())) {\n")
                .indent()
                .write("e.setTemplateLine(functions.get(e.getFunctionName()));\n")
                .outdent()
                .write("}\n")
                .outdent()
                .write('}\n\n')
                .write("throw e;\n")
                .outdent()
                .write("}\n\n")
            ;
        }
    }
};
