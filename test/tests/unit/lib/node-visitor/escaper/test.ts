import * as tape from 'tape';
import {FilesystemEnvironment} from "../../../../../../src/lib/environment/filesystem-environment";
import {TwingLoaderArray} from "../../../../../../src/lib/loader/array";
import {TwingNodeVisitorEscaper} from "../../../../../../src/lib/node-visitor/escaper";
import {createTextNode} from "../../../../../../src/lib/node/text";
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createBaseNode} from "../../../../../../src/lib/node";
import {TwingSource} from "../../../../../../src/lib/source";
import {createModuleNode} from "../../../../../../src/lib/node/module";
import {TwingNodeVisitorSafeAnalysis} from "../../../../../../src/lib/node-visitor/safe-analysis";
import {createPrintNode} from "../../../../../../src/lib/node/print";
import {stub} from "sinon";

tape('node-visitor/escaper', (test) => {
    test.test('doEnterNode', (test) => {
        test.test('with "module" node', function(test) {
            let env = new FilesystemEnvironment(new TwingLoaderArray({}));
            let visitor = new TwingNodeVisitorEscaper();
            let body = createTextNode('foo', 1, 1);
            let parent = createConstantNode('layout.twig', 1, 1);
            let blocks = createBaseNode(null);
            let macros = createBaseNode(null);
            let traits = createBaseNode(null);
            let source = new TwingSource('{{ foo }}', 'foo.twig');
            let module = createModuleNode(body, parent, blocks, macros, traits, [], source, 1, 1);

            stub(env, 'hasExtension').returns(false);

            test.equals(visitor.enterNode(module, env), module, 'returns the node untouched');

            test.end();
        });

        test.end();
    });

    test.test('doLeaveNode', (test) => {
        test.test('with safe "print" node', function(test) {
            let env = new FilesystemEnvironment(new TwingLoaderArray({}));
            let visitor = new TwingNodeVisitorEscaper();
            let safeAnalysis = new TwingNodeVisitorSafeAnalysis();
            let print = createPrintNode(createConstantNode('foo', 1, 1), 1, 1);

            stub(env, 'hasExtension').returns(false);
            stub(visitor, 'needEscaping' as any).returns('html');
            stub(safeAnalysis, 'getSafe').returns('html');

            Reflect.set(visitor, 'safeAnalysis', safeAnalysis);

            test.equals(visitor.leaveNode(print, env), print, 'returns the node untouched');

            test.end();
        });

        test.end();
    });

    test.end();
});
