import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createPrintNode} from "../../../../../../src/lib/node/print";
import {createNameNode} from "../../../../../../src/lib/node/expression/name";
import {createBaseNode} from "../../../../../../src/lib/node";
import {createIfNode} from "../../../../../../src/lib/node/if";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('IfNode', ({test}) => {
    test('factory', ({same, end}) => {
        let t = createBaseNode(null, {
            0: createConstantNode(true, 1, 1),
            1: createPrintNode(createNameNode('foo', 1, 1), 1, 1)
        }, {}, 1, 1);
        let elseNode = null;
        let node = createIfNode(t, elseNode, 1, 1);

        same(node.children.tests, t);
        same(node.children.else, null);

        elseNode = createPrintNode(createNameNode('bar', 1, 1), 1, 1);
        node = createIfNode(t, elseNode, 1, 1);

        same(node.children.else, elseNode);
        same(node.type, 'if');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({test}) => {
        const compiler = createMockCompiler();

        test('without else', ({same, end}) => {
            let t = createBaseNode(null, {}, {
                0: createConstantNode(true, 1, 1),
                1: createPrintNode(createNameNode('foo', 1, 1), 1, 1)
            }, 1, 1);
            let else_ = null;
            let node = createIfNode(t, else_, 1, 1);

            same(compiler.compile(node).source, `if (this.evaluate(true)) {
    outputBuffer.echo((context.has(\`foo\`) ? context.get(\`foo\`) : null));
}
`);
            end();
        });

        test('with multiple tests', ({same, end}) => {
            let t = createBaseNode(null, {}, {
                0: createConstantNode(true, 1, 1),
                1: createPrintNode(createNameNode('foo', 1, 1), 1, 1),
                2: createConstantNode(false, 1, 1),
                3: createPrintNode(createNameNode('bar', 1, 1), 1, 1)
            }, 1, 1);
            let else_ = null;

            let node = createIfNode(t, else_, 1, 1);

            same(compiler.compile(node).source, `if (this.evaluate(true)) {
    outputBuffer.echo((context.has(\`foo\`) ? context.get(\`foo\`) : null));
}
else if (this.evaluate(false)) {
    outputBuffer.echo((context.has(\`bar\`) ? context.get(\`bar\`) : null));
}
`);
            end();
        });

        test('with else', ({same, end}) => {
            let t = createBaseNode(null, {}, {
                0: createConstantNode(true, 1, 1),
                1: createPrintNode(createNameNode('foo', 1, 1), 1, 1)
            }, 1, 1);
            let else_ = createPrintNode(createNameNode('bar', 1, 1), 1, 1);

            let node = createIfNode(t, else_, 1, 1);

            same(compiler.compile(node).source, `if (this.evaluate(true)) {
    outputBuffer.echo((context.has(\`foo\`) ? context.get(\`foo\`) : null));
}
else {
    outputBuffer.echo((context.has(\`bar\`) ? context.get(\`bar\`) : null));
}
`);
            end();
        });

        test('with multiple elseif', ({same, end}) => {
            let t = createBaseNode(null, {}, {
                0: createNameNode('a', 1, 1),
                1: createPrintNode(createConstantNode('a', 1, 1), 1, 1),
                2: createNameNode('b', 1, 1),
                3: createPrintNode(createConstantNode('b', 1, 1), 1, 1),
                4: createNameNode('c', 1, 1),
                5: createPrintNode(createConstantNode('c', 1, 1), 1, 1),
            }, 1, 1);
            let else_ = createPrintNode(createNameNode('bar', 1, 1), 1, 1);

            let node = createIfNode(t, else_, 1, 1);

            same(compiler.compile(node).source, `if (this.evaluate((context.has(\`a\`) ? context.get(\`a\`) : null))) {
    outputBuffer.echo(\`a\`);
}
else if (this.evaluate((context.has(\`b\`) ? context.get(\`b\`) : null))) {
    outputBuffer.echo(\`b\`);
}
else if (this.evaluate((context.has(\`c\`) ? context.get(\`c\`) : null))) {
    outputBuffer.echo(\`c\`);
}
else {
    outputBuffer.echo((context.has(\`bar\`) ? context.get(\`bar\`) : null));
}
`);
            end();
        });
    });
});
