import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createNameNode} from "../../../../../../src/lib/node/expression/name";
import {createWithNode} from "../../../../../../src/lib/node/with";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('WithNode', ({test}) => {
    let bodyNode = createNameNode('foo', 1, 1);
    let variablesNode = createConstantNode('bar', 1, 1);

    test('factory', ({same, end}) => {
        let node = createWithNode(bodyNode, variablesNode, false, 1, 1);

        same(node.attributes.only, false);
        same(node.children.body, bodyNode);
        same(node.children.variables, variablesNode);
        same(node.type, 'with');
        same(node.line, 1);
        same(node.column, 1);

        end();
    });

    test('compile', ({same, end}) => {
        let node = createWithNode(bodyNode, variablesNode, false, 1, 1);
        let compiler = createMockCompiler();

        same(compiler.compile(node).source, `{
    let tmp = \`bar\`;
    if (typeof (tmp) !== 'object') {
        throw new this.RuntimeError('Variables passed to the "with" tag must be a hash.', 1, this.source);
    }
    context.set('_parent', context.clone());
    context = new this.Context(this.environment.mergeGlobals(this.merge(context, this.convertToMap(tmp))));
}

(context.has(\`foo\`) ? context.get(\`foo\`) : null)context = context.get('_parent');
`);

        end();
    });
});
