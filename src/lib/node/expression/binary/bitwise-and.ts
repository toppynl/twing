import {BaseBinaryNode, createBinaryNodeFactory} from "../binary";

export interface BitwiseAndNode extends BaseBinaryNode<"bitwise_and"> {
}

export const createBitwiseAndNode = createBinaryNodeFactory<BitwiseAndNode>("bitwise_and", '&');
