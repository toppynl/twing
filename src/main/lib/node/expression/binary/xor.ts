import type {TwingBaseBinaryNode} from "../binary";
import {createBinaryNodeFactory} from "../binary";

export interface TwingXorNode extends TwingBaseBinaryNode<"xor"> {}
export const createXorNode = createBinaryNodeFactory<TwingXorNode>("xor");
