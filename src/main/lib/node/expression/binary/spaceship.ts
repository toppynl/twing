import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingSpaceshipNode extends TwingBaseBinaryNode<"spaceship"> {
}

export const createSpaceshipNode = createBinaryNodeFactory<TwingSpaceshipNode>("spaceship");
