import * as tape from 'tape';
import {TwingNodeVisitorSafeAnalysis} from "../../../../../../src/lib/node-visitor/safe-analysis";
import {FilesystemEnvironment} from "../../../../../../src/lib/environment/filesystem-environment";
import {TwingLoaderArray} from "../../../../../../src/lib/loader/array";
import {TwingNodeExpressionFilter} from "../../../../../../src/lib/node/expression/call/filter";
import {TwingNode} from "../../../../../../src/lib/node";
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {TwingNodeExpressionFunction} from "../../../../../../src/lib/node/expression/call/function";
import {
    createMethodCallNode
} from "../../../../../../src/lib/node/expression/method-call";
import {createGetAttributeNode} from "../../../../../../src/lib/node/expression/get-attribute";
import {createNameNode} from "../../../../../../src/lib/node/expression/name";

const sinon = require('sinon');

tape('node-visitor/safe-analysis', (test) => {
    test.test('doLeaveNode', (test) => {
        test.test('support not registered filter', function(test) {
            let visitor = new TwingNodeVisitorSafeAnalysis();
            let doLeaveNode = Reflect.get(visitor, 'doLeaveNode').bind(visitor);
            let env = new FilesystemEnvironment(new TwingLoaderArray({}));
            let filterNode = new TwingNodeExpressionFilter(new TwingNode(),
                createConstantNode('foo', 1, 1), new TwingNode(), 1, 1);

            let setSafeStub = sinon.stub(visitor, 'setSafe');

            doLeaveNode(filterNode, env);

            test.true(setSafeStub.calledWith(filterNode, []));

            test.end();
        });

        test.test('support not registered function', function(test) {
            let visitor = new TwingNodeVisitorSafeAnalysis();
            let doLeaveNode = Reflect.get(visitor, 'doLeaveNode').bind(visitor);
            let env = new FilesystemEnvironment(new TwingLoaderArray({}));
            let filterNode = new TwingNodeExpressionFunction('foo', new TwingNode(), 1, 1);

            let setSafeStub = sinon.stub(visitor, 'setSafe');

            doLeaveNode(filterNode, env);

            test.true(setSafeStub.calledWith(filterNode, []));

            test.end();
        });

        test.test('support not registered macro', function(test) {
            let visitor = new TwingNodeVisitorSafeAnalysis();
            let doLeaveNode = Reflect.get(visitor, 'doLeaveNode').bind(visitor);
            let env = new FilesystemEnvironment(new TwingLoaderArray({}));
            let filterNode = createMethodCallNode(createNameNode('foo', 1, 1), 'foo', null, 1, 1);

            let setSafeStub = sinon.stub(visitor, 'setSafe');

            doLeaveNode(filterNode, env);

            test.true(setSafeStub.calledWith(filterNode, []));

            test.end();
        });

        test.test('support safe "EXPRESSION_GET_ATTR" nodes', function(test) {
            let visitor = new TwingNodeVisitorSafeAnalysis();
            let doLeaveNode = Reflect.get(visitor, 'doLeaveNode').bind(visitor);
            let env = new FilesystemEnvironment(new TwingLoaderArray({}));
            let filterNode = createGetAttributeNode(createNameNode('foo', 1, 1), null, null, "any", 1, 1);

            let setSafeStub = sinon.stub(visitor, 'setSafe');

            visitor.setSafeVars(['foo']);

            doLeaveNode(filterNode, env);

            test.true(setSafeStub.calledWith(filterNode, ['all']));

            test.end();
        });

        test.end();
    });

    test.end();
});
