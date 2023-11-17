import {createMethodCallNode} from "../node/expression/method-call";
import {createNodeVisitor, TwingNodeVisitor} from "../node-visitor";

export const createMacroAutoImportNodeVisitor = (): TwingNodeVisitor => {
    return createNodeVisitor(
        (node) => {
            return node;
        },
        (node) => {
            if ((node.is("get_attribute")) && (node.children.target.is("name")) && (node.children.target.attributes.name === '_self') && (node.children.attribute.is("constant"))) {
                const name = node.children.attribute.attributes.value as string;
                const methodCallNode = createMethodCallNode(node.children.target, name, node.children.arguments, node.line, node.column);
                
                node = methodCallNode;
            }

            return node;
        },
        -10 // we must run before auto-escaping
    )
};
