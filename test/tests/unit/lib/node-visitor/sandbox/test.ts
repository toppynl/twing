import * as tape from 'tape';
import {FilesystemEnvironment} from "../../../../../../src/lib/environment/filesystem-environment";
import {TwingLoaderArray} from "../../../../../../src/lib/loader/array";
import {TwingNodeVisitorSandbox} from "../../../../../../src/lib/node-visitor/sandbox";
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";

tape('node-visitor/sandbox', (test) => {
    test.test('doEnterNode', (test) => {
        test.test('with not "module" node', function(test) {
            let env = new FilesystemEnvironment(new TwingLoaderArray({}));
            let visitor = new TwingNodeVisitorSandbox();
            let node = createConstantNode('foo', 1, 1);

            test.equals(visitor.enterNode(node as any, env), node, 'returns the node untouched');

            test.end();
        });

        test.end();
    });

    test.end();
});
