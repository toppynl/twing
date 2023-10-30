import {BaseNameNode, createBaseNameNode} from "./name";

export interface AssignNameNode extends BaseNameNode<"assign_name"> {
}

export const createAssignNameNode = (
    name: string,
    line: number,
    column: number
): AssignNameNode => {
    const baseNode = createBaseNameNode("assign_name", name, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .raw('context.proxy[')
                .string(baseNode.attributes.name)
                .raw(']')
            ;
        }
    };
};
