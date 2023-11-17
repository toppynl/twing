import {TwingBaseExpressionNode, TwingBaseExpressionNodeAttributes, createBaseExpressionNode} from "../expression";

export const temporaryNameNodeType = "temp_name";

export type TemporaryNameNodeAttributes = TwingBaseExpressionNodeAttributes & {
    name: string;
    declaration: boolean;
};

export interface TwingTemporaryNameNode extends TwingBaseExpressionNode<typeof temporaryNameNodeType, TemporaryNameNodeAttributes> {
}

export const createTemporaryNameNode = (
    name: string,
    declaration: boolean,
    line: number,
    column: number
): TwingTemporaryNameNode => {
    const baseNode = createBaseExpressionNode(temporaryNameNodeType, {
        name,
        declaration
    }, {}, line, column);

    return {
        ...baseNode,
        compile: (compiler) => {
            const {declaration, name} = baseNode.attributes;

            compiler
                .write(`${declaration ? 'let ' : ''}$_`)
                .write(name)
                .write('_')
            ;
        }
    }
};
