import * as tape from 'tape';
import {TwingNodeTraverser} from "../../../../../src/lib/node-traverser";
import {FilesystemEnvironment} from "../../../../../src/lib/environment/filesystem-environment";
import {TwingLoaderArray} from "../../../../../src/lib/loader/array";
import {TwingNode} from "../../../../../src/lib/node";
import {TwingBaseNodeVisitor} from "../../../../../src/lib/base-node-visitor";

class TwingTestNodeVisitorRemoveVisitor extends TwingBaseNodeVisitor {
    nodeToRemove: TwingNode;

    constructor(nodeToRemove: TwingNode) {
        super();

        this.nodeToRemove = nodeToRemove;
    }

    doEnterNode(node: TwingNode) {
        return node;
    }

    doLeaveNode(node: TwingNode) {
        if (node === this.nodeToRemove) {
            return null;
        }

        return node;
    }

    getPriority(): number {
        return 0;
    }
}

tape('node-traverser', (test) => {
    test.test('constructor', (test) => {
        test.doesNotThrow(function() {
            new TwingNodeTraverser(new FilesystemEnvironment(new TwingLoaderArray({})));
        });

        test.end();
    });

    test.test('traverseForVisitor', (test) => {
        let traverser = new TwingNodeTraverser(new FilesystemEnvironment(new TwingLoaderArray({})));

        let nodeToRemove = new TwingNode();
        let visitor = new TwingTestNodeVisitorRemoveVisitor(nodeToRemove);
        let node = traverser.traverseWithVisitor(visitor, new TwingNode(new Map([[0, nodeToRemove]])));

        test.same(node.getNodes(), new Map());

        test.end();
    });


    test.end();
});
