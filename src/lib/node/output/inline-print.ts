import {TwingBaseNode, TwingBaseNodeAttributes} from "../../node";
import {TwingBaseOutputNode, createBaseOutputNode} from "../output";

export const inlinePrintNodeType = "inline_print";

export interface TwingInlinePrintNode extends TwingBaseOutputNode<typeof inlinePrintNodeType, TwingBaseNodeAttributes, {
    node: TwingBaseNode
}> {
}

export const createInlinePrintNode = (
    node: TwingBaseNode,
    line: number,
    column: number,
    tag: string | null = null
): TwingInlinePrintNode => {
    const outputNode = createBaseOutputNode(inlinePrintNodeType, {}, {
        node
    }, line, column, tag);

    const inlinePrintNode: TwingInlinePrintNode = {
        ...outputNode,
        execute: (...args) => {
            const [, , outputBuffer] = args;

            return inlinePrintNode.children.node.execute(...args)
                .then(outputBuffer.echo);
        }
    };

    return inlinePrintNode;
};
