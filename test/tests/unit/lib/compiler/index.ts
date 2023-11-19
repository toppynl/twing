import * as tape from 'tape';
import {createBaseNode} from "../../../../../src/lib/node";
import {createConstantNode} from "../../../../../src/lib/node/expression/constant";
import {createCompiler} from "../../../../../src/lib/compiler";
import {createRuntime} from "../../../../../src/lib/runtime";
import {createExtensionSet} from "../../../../../src/lib/extension-set";
import {createArrayLoader} from "../../../../../src/lib/loader/array";

const createCompilerEnvironment = () => {
    return createRuntime(
        createArrayLoader({}),
        {},
        createExtensionSet(),
        {}
    );
}

tape('Compiler', ({test}) => {
    test('subcompile method', ({same, end}) => {
        const node = createBaseNode(null, {}, {
            0: createConstantNode(1, 1, 1)
        }, 1, 1, 'foo');
        const compiler = createCompiler(createCompilerEnvironment());

        same(compiler.compile(node).subCompile(node).source, '11', 'doesn\'t add indentation');

        end();
    });

    test('string method', ({same, end}) => {
        const node = createBaseNode(null, {}, {}, 1, 1, 'foo');

        const compiler = createCompiler(createCompilerEnvironment());

        same(compiler.compile(node).string('').source, '\`\`', 'supports empty parameter');
        same(compiler.compile(node).string(null).source, '\`\`', 'supports null parameter');
        same(compiler.compile(node).string(undefined).source, '\`\`', 'supports undefined parameter');
        same(compiler.compile(node).string('${foo}').source, '\`\\${foo}\`', 'escape interpolation delimiter');
        same(compiler.compile(node).string('${foo}${foo}').source, '\`\\${foo}\\${foo}\`', 'escape interpolation delimiter globally');

        end();
    });

    test('render method', ({same, end}) => {
        const node = createBaseNode(null, {}, {}, 1, 1, 'foo');

        const compiler = createCompiler(createCompilerEnvironment());

        same(compiler.compile(node).render({
            1: 'a',
            'b': 2,
            'c': '3'
        }).source, '{"1": \`a\`, "b": 2, "c": \`3\`}', 'supports hashes');
        same(compiler.compile(node).render(undefined).source, 'undefined', 'supports undefined');
        same(compiler.compile(node).render(new Map([[0, 1], [1, 2]])).source, 'new Map([[0, 1], [1, 2]])', 'supports ES6 maps');

        end();
    });
});
