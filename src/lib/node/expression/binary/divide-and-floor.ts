import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export const divideAndFloorNodeType = "floor_div";

export interface TwingDivideAndFloorNode extends TwingBaseBinaryNode<typeof divideAndFloorNodeType> {
}

export const createDivideAndFloorNode = createBinaryNodeFactory<TwingDivideAndFloorNode>(divideAndFloorNodeType, '/', {
    compile(compiler, baseNode) {
        compiler.write('Math.floor(');
        baseNode.compile(compiler);
        compiler.write(')');
    }
});
