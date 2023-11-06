import {BaseNode, BaseNodeAttributes, createBaseNode, Node} from "../node";

export type CheckSecurityNodeAttributes = BaseNodeAttributes & {
    usedFilters: Map<string, Node | string>;
    usedTags: Map<string, Node | string>;
    usedFunctions: Map<string, Node | string>;
};

export interface CheckSecurityNode extends BaseNode<"check_security", CheckSecurityNodeAttributes> {
}

export const createCheckSecurityNode = (
    usedFilters: Map<string, Node>,
    usedTags: Map<string, Node>,
    usedFunctions: Map<string, Node>,
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
                tags.set(name, node.line);
            }

            const filters = new Map();

            for (const [name, node] of usedFilters) {
                filters.set(name, node.line);
            }

            const functions = new Map();

            for (const [name, node] of usedFunctions) {
                functions.set(name, node.line);
            }

            compiler
                .write('const tags = ').render(tags).raw(";\n")
                .write('const filters = ').render(filters).raw(";\n")
                .write('const functions = ').render(functions).raw(";\n\n")
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
                .write("catch (error) {\n")
                .indent()
                .write("if (error.name === 'TwingSandboxSecurityError') {\n")
                .indent()
                .write("error.source = template.source;\n\n")
                .write("if ((typeof error.tagName === 'string') && tags.has(error.tagName)) {\n")
                .indent()
                .write("error.line = tags.get(error.tagName);\n")
                .outdent()
                .write("}\n")
                .write("else if ((typeof error.filterName === 'string') && filters.has(error.filterName)) {\n")
                .indent()
                .write("error.line = filters.get(error.filterName);\n")
                .outdent()
                .write("}\n")
                .write("else if ((typeof error.functionName === 'string') && functions.has(error.functionName)) {\n")
                .indent()
                .write("error.line = functions.get(error.functionName);\n")
                .outdent()
                .write("}\n")
                .outdent()
                .write('}\n\n')
                .write("throw error;\n")
                .outdent()
                .write("}\n\n")
            ;
        }
    }
};
