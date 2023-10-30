import {TwingBaseNodeVisitor} from "../base-node-visitor";
import {Node} from "../node";
import {TwingEnvironment} from "../environment";
import {createMethodCallNode} from "../node/expression/method-call";
import type {ArrayNode} from "../node/expression/array";

export class TwingNodeVisitorMacroAutoImport extends TwingBaseNodeVisitor {
    public doEnterNode(node: Node, _env: TwingEnvironment) {
        return node;
    }

    public doLeaveNode(node: Node, _env: TwingEnvironment) {
        if ((node.is("get_attribute")) && (node.children.target.is("name")) && (node.children.target.attributes.name === '_self') && (node.children.attribute.is("expression_constant"))) {
            let name = node.children.attribute.attributes.value as string;

            node = createMethodCallNode(node.children.target, name, node.children.arguments as unknown as ArrayNode, node.line, node.column); // todo
            node.attributes.safe = true;
        }

        return node;
    }

    public getPriority() {
        // we must run before auto-escaping
        return -10;
    }
}
