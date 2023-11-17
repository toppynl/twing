import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, TwingNode} from "../node";

export type CheckSecurityNodeAttributes = TwingBaseNodeAttributes & {
    usedFilters: Map<string, TwingNode | string>;
    usedTags: Map<string, TwingNode | string>;
    usedFunctions: Map<string, TwingNode | string>;
};

export interface TwingCheckSecurityNode extends TwingBaseNode<"check_security", CheckSecurityNodeAttributes> {
}

export const createCheckSecurityNode = (
    usedFilters: Map<string, TwingNode>,
    usedTags: Map<string, TwingNode>,
    usedFunctions: Map<string, TwingNode>,
    line: number,
    column: number
): TwingCheckSecurityNode => {
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
                .write('const tags = ').render(tags).write(";\n")
                .write('const filters = ').render(filters).write(";\n")
                .write('const functions = ').render(functions).write(";\n\n")
                .write("try {\n")
                .write("runtime.isSandboxed && runtime.checkSecurity(\n")
                .write(!tags.size ? "[],\n" : "['" + [...tags.keys()].join('\', \'') + "'],\n")
                .write(!filters.size ? "[],\n" : "['" + [...filters.keys()].join('\', \'') + "'],\n")
                .write(!functions.size ? "[]\n" : "['" + [...functions.keys()].join('\', \'') + "']\n")
                .write(");\n")
                .write("}\n")
                .write("catch (error) {\n")
                .write("if (error.name === 'TwingSandboxSecurityError') {\n")
                .write("error.source = template.source;\n\n")
                .write("if ((typeof error.tagName === 'string') && tags.has(error.tagName)) {\n")
                .write("error.line = tags.get(error.tagName);\n")
                .write("}\n")
                .write("else if ((typeof error.filterName === 'string') && filters.has(error.filterName)) {\n")
                .write("error.line = filters.get(error.filterName);\n")
                .write("}\n")
                .write("else if ((typeof error.functionName === 'string') && functions.has(error.functionName)) {\n")
                .write("error.line = functions.get(error.functionName);\n")
                .write("}\n")
                .write('}\n\n')
                .write("throw error;\n")
                .write("}\n\n")
            ;
        }
    }
};
