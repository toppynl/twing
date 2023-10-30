import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createTextNode} from "../../../../../../src/lib/node/text";
import {createNameNode} from "../../../../../../src/lib/node/expression/name";
import {createBaseNode} from "../../../../../../src/lib/node";
import {createMacroNode} from "../../../../../../src/lib/node/macro";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('MacroNode', ({test}) => {
    test('factory', ({same, end}) => {
        const body = createTextNode('foo', 1, 1);

        const argumentsNode = createBaseNode(null, {}, {
            0: createNameNode('foo', 1, 1)
        }, 1, 1);
        const node = createMacroNode('foo', body, argumentsNode, 1, 1);

        same(node.children.body, body);
        same(node.children.arguments, argumentsNode);
        same(node.attributes.name, 'foo');
        same(node.type, 'macro');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({same, end}) => {
        const body = createTextNode('foo', 1, 1);

        const argumentsNode = createBaseNode(null, {}, {
            foo: createConstantNode(null, 1, 1),
            bar: createConstantNode('Foo', 1, 1)
        }, 1, 1);
        const node = createMacroNode('foo', body, argumentsNode, 1, 1);
        const compiler = createMockCompiler();

        same(compiler.compile(node).source, `async (outputBuffer, __foo__ = null, __bar__ = \`Foo\`, ...__varargs__) => {
    let aliases = this.aliases.clone();
    let context = new this.Context(this.environment.mergeGlobals(new Map([
        [\`foo\`, __foo__],
        [\`bar\`, __bar__],
        [\`varargs\`, __varargs__]
    ])));

    let blocks = new Map();
    let result;
    let error;

    outputBuffer.start();
    try {
        outputBuffer.echo(\`foo\`);

        let tmp = outputBuffer.getContents();
        result = (tmp === '') ? '' : new this.Markup(tmp, this.environment.getCharset());
    }
    catch (e) {
        error = e;
    }

    outputBuffer.endAndClean();

    if (error) {
        throw error;
    }
    return result;
}`);

        end();
    });
});
