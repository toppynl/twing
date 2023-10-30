import type {BaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface FloorDivNode extends BaseBinaryNode<"floor_div"> {
}

export const createFloorDivNode = createBinaryNodeFactory<FloorDivNode>("floor_div", '/', {
    compile(compiler, baseNode) {
        compiler.raw('Math.floor(');
        baseNode.compile(compiler);
        compiler.raw(')');
    }
});
