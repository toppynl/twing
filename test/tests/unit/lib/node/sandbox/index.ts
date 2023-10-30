import * as tape from 'tape';
import {createTextNode} from "../../../../../../src/lib/node/text";
import {createSandboxNode} from "../../../../../../src/lib/node/sandbox";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('SandboxNode', ({test}) => {
    test('factory', ({same, end}) => {
        let body = createTextNode('foo', 1, 1);
        let node = createSandboxNode(body, 1, 1);

        same(node.children.body, body);
        same(node.type, 'sandbox');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({same, end}) => {
        let body = createTextNode('foo', 1, 1);
        let node = createSandboxNode(body, 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `await (async () => {
    let alreadySandboxed = this.environment.isSandboxed();
    if (!alreadySandboxed) {
        this.environment.enableSandbox();
    }
    outputBuffer.echo(\`foo\`);
    if (!alreadySandboxed) {
        this.environment.disableSandbox();
    }
})();
`);

        end();
    });
});
