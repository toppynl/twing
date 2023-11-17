import {TwingBaseNode, TwingBaseNodeAttributes, TwingBaseNodeChildren, createBaseNode} from "../node";
import {TwingCompiler} from "../compiler";

export interface TwingBaseOutputNode<
    Type extends string, 
    Attributes extends TwingBaseNodeAttributes = TwingBaseNodeAttributes, 
    Children extends TwingBaseNodeChildren = TwingBaseNodeChildren
> extends TwingBaseNode<Type, Attributes, Children> {
    
}

export const createBaseOutputNode = <Type extends string, Attributes extends TwingBaseNodeAttributes, Children extends TwingBaseNodeChildren>(
    type: Type,
    attributes: Attributes,
    children: Children,
    compileValue: (compiler: TwingCompiler) => void,
    line: number,
    column: number,
    tag: string | null
): TwingBaseOutputNode<Type, Attributes, Children> => {
    const baseNode = createBaseNode(type, attributes, children, line, column, tag);
    
    return {
        ...baseNode,
        compile: (compiler) => {
            compiler
                .write('outputBuffer.echo(\n')
            ;
            
            compileValue(compiler);

            compiler
                .write('\n')
                .write(')')
            ;
        },
        isAnOutputNode: true
    };
};
