import {TwingBaseNode, createBaseNode, getChildrenCount, TwingBaseNodeAttributes} from "../node";
import {evaluate} from "../helpers/evaluate";

type TwingIfNodeChildren = {
    tests: TwingBaseNode;
    else?: TwingBaseNode;
};

export interface TwingIfNode extends TwingBaseNode<'if', TwingBaseNodeAttributes, TwingIfNodeChildren> {
}

export const createIfNode = (
    testNode: TwingBaseNode,
    elseNode: TwingBaseNode | null,
    line: number,
    column: number,
    tag: string | null = null
): TwingIfNode => {
    const children: TwingIfNodeChildren = {
        tests: testNode
    };

    if (elseNode) {
        children.else = elseNode;
    }
    
    const baseNode = createBaseNode('if', {}, children, line, column, tag);

    const node: TwingIfNode = {
        ...baseNode,
        execute: async (...args) => {
            const count = getChildrenCount(testNode);

            let index: number = 0;
            
            while (index < count) {
                const condition = testNode.children[index];
                const conditionResult = await condition.execute(...args);
                
                if (evaluate(conditionResult)) {
                    // the condition is satisfied, we execute the belonging body and return the result
                    const body = testNode.children[index + 1];
                    
                    return body.execute(...args);
                }
                
                index += 2;
            }
            
            if (elseNode !== null) {
                return elseNode.execute(...args);
            }
        }
    };

    return node;
}
