import {BaseExpressionNode, BaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";

export type TemporaryNameNodeAttributes = BaseExpressionNodeAttributes & {
    name: string;
    declaration: boolean;
};

export interface TemporaryNameNode extends BaseExpressionNode<"temp_name", TemporaryNameNodeAttributes> {
}

export const createTemporaryNameNode = (
    name: string,
    declaration: boolean,
    line: number,
    column: number
): TemporaryNameNode => {
    const baseNode = createBaseExpressionNode("temp_name", {
        name,
        declaration
    }, {}, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            const {declaration, name} = baseNode.attributes;

            compiler
                .raw(`${declaration ? 'let ' : ''}$_`)
                .raw(name)
                .raw('_')
            ;
        }
    }
};
