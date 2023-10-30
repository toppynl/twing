import * as tape from 'tape';
import {createBaseNode} from "../../../../../src/lib/node";
import {createConstantNode} from "../../../../../src/lib/node/expression/constant";
import {createCompiler} from "../../../../../src/lib/compiler";
import {MockEnvironment} from "../../../../mock/environment";
import {MockLoader} from "../../../../mock/loader";
import {createBodyNode} from "../../../../../src/lib/node/body";
import {createTextNode} from "../../../../../src/lib/node/text";

tape('Compiler', ({test}) => {
    test('subcompile method', ({same, end}) => {
        const node = createBaseNode(null, {}, {
            0: createConstantNode(1, 1, 1)
        }, 1, 1, 'foo');
        const compiler = createCompiler(new MockEnvironment(new MockLoader()));

        same(compiler.compile(node).indent().subCompile(node).source, '11', 'doesn\'t add indentation when raw is not set');
        same(compiler.compile(node).indent().subCompile(node, true).source, '11', 'doesn\'t add indentation when raw is set to true');
        same(compiler.compile(node).indent().subCompile(node, false).source, '1    1', 'add indentation when raw is set to false');

        end();
    });

    test('string method', ({same, end}) => {
        const node = createBaseNode(null, {}, {}, 1, 1, 'foo');

        const compiler = createCompiler(new MockEnvironment(new MockLoader));

        same(compiler.compile(node).string('').source, '\`\`', 'supports empty parameter');
        same(compiler.compile(node).string(null).source, '\`\`', 'supports null parameter');
        same(compiler.compile(node).string(undefined).source, '\`\`', 'supports undefined parameter');
        same(compiler.compile(node).string('${foo}').source, '\`\\${foo}\`', 'escape interpolation delimiter');
        same(compiler.compile(node).string('${foo}${foo}').source, '\`\\${foo}\\${foo}\`', 'escape interpolation delimiter globally');

        end();
    });

    test('repr method', ({same, end}) => {
        const node = createBaseNode(null, {}, {}, 1, 1, 'foo');

        const compiler = createCompiler(new MockEnvironment(new MockLoader));

        same(compiler.compile(node).render({1: 'a', 'b': 2, 'c': '3'}).source, '{"1": \`a\`, "b": 2, "c": \`3\`}', 'supports hashes');
        same(compiler.compile(node).render(undefined).source, 'undefined', 'supports undefined');
        same(compiler.compile(node).render(new Map([[0, 1], [1, 2]])).source, 'new Map([[0, 1], [1, 2]])', 'supports ES6 maps');

        end();
    });

    test('outdent method', ({same, fail, end}) => {
        const node = createBaseNode(null, {}, {}, 1, 1, 'foo');

        const compiler = createCompiler(new MockEnvironment(new MockLoader));

        try {
            compiler.compile(node).outdent();

            fail();
        } catch (e) {
            same(e.message, 'Unable to call outdent() as the indentation would become negative.', 'throws an error if the indentation becomes negative');
        }

        end();
    });

    test('addSourceMapEnter', ({same, end}) => {
        const compiler = createCompiler(new MockEnvironment(new MockLoader, {
            source_map: true
        }));

        const bodyNode = createBodyNode(createTextNode('foo', 1, 1), 1, 1);

        bodyNode.compile = (compiler) => {
            compiler.addSourceMapEnter(bodyNode);
        };

        same(compiler.compile(bodyNode).source, 'this.environment.enterSourceMapBlock(1, 1, `body`, this.source, outputBuffer);\n');

        end();
    });
});
