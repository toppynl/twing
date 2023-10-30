import * as tape from 'tape';
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createAssignNameNode} from "../../../../../../src/lib/node/expression/assign-name";
import {createNameNode} from "../../../../../../src/lib/node/expression/name";
import {createPrintNode} from "../../../../../../src/lib/node/print";
import {createBaseNode} from "../../../../../../src/lib/node";
import {createForNode} from "../../../../../../src/lib/node/for";
import {createMockCompiler} from "../../../../../mock/compiler";

tape('ForNode', ({test}) => {
    test('factory', ({same, end}) => {
        const keyTarget = createAssignNameNode('key', 1, 1);
        const valueTarget = createAssignNameNode('item', 1, 1);
        const sequence = createNameNode('items', 1, 1);
        const ifExpr = createConstantNode(true, 1, 1);

        const body = createBaseNode(null, {}, {
            0: createPrintNode(createNameNode('foo', 1, 1), 1, 1)
        }, 1, 1);

        let elseNode = null;
        let node = createForNode(keyTarget, valueTarget, sequence, ifExpr, body, elseNode, 1, 1);

        same(node.attributes.with_loop, true);
        same(node.attributes.ifexpr, true);
        same(node.children.key_target, keyTarget);
        same(node.children.value_target, valueTarget);
        same(node.children.seq, sequence);
        same(node.children.else, null);
        same(node.line, 1);
        same(node.column, 1);

        elseNode = createPrintNode(createNameNode('foo', 1, 1), 1, 1);

        node = createForNode(keyTarget, valueTarget, sequence, ifExpr, body, elseNode, 1, 1);

        node.attributes.with_loop = false;

        same(node.children.else, elseNode);
        same(node.type, 'for');

        end();
    });

    test('compile', ({test}) => {
        const compiler = createMockCompiler();

        test('without loop', ({same, end}) => {
            const keyTarget = createAssignNameNode('key', 1, 1);
            const valueTarget = createAssignNameNode('item', 1, 1);
            const sequence = createNameNode('items', 1, 1);
            const ifExpression = null;
            const body = createBaseNode(null, {}, {
                0: createPrintNode(createNameNode('foo', 1, 1), 1, 1)
            }, 1, 1);
            const elseNode = null;
            const node = createForNode(keyTarget, valueTarget, sequence, ifExpression, body, elseNode, 1, 1);

            node.attributes.with_loop = false;

            same(compiler.compile(node).source, `context.set('_parent', context.clone());

await (async () => {
    let c = this.ensureTraversable((context.has(\`items\`) ? context.get(\`items\`) : null));

    if (c === context) {
        context.set('_seq', context.clone());
    }
    else {
        context.set('_seq', c);
    }
})();

await this.iterate(context.get('_seq'), async (__key__, __value__) => {
    context.proxy[\`key\`] = __key__;
    context.proxy[\`item\`] = __value__;
    outputBuffer.echo((context.has(\`foo\`) ? context.get(\`foo\`) : null));
});
(() => {
    let parent = context.get('_parent');
    context.delete('_seq');
    context.delete('_iterated');
    context.delete('key');
    context.delete('item');
    context.delete('_parent');
    context.delete('loop');
    for (let [k, v] of parent) {
        if (!context.has(k)) {
            context.set(k, v);
        }
    }
})();
`);

            end();
        });

        test('with loop', ({same, end}) => {
            // ...
            const keyTarget = createAssignNameNode('k', 1, 1);
            const valueTarget = createAssignNameNode('v', 1, 1);
            const sequence = createNameNode('items', 1, 1);
            const ifExpression = null;
            const body = createBaseNode(null, {}, {
                0: createPrintNode(createNameNode('foo', 1, 1), 1, 1)
            }, 1, 1);
            const elseNode = null;
            const node = createForNode(keyTarget, valueTarget, sequence, ifExpression, body, elseNode, 1, 1);

            node.attributes.with_loop = true;

            same(compiler.compile(node).source, `context.set('_parent', context.clone());

await (async () => {
    let c = this.ensureTraversable((context.has(\`items\`) ? context.get(\`items\`) : null));

    if (c === context) {
        context.set('_seq', context.clone());
    }
    else {
        context.set('_seq', c);
    }
})();

context.set('loop', new Map([
  ['parent', context.get('_parent')],
  ['index0', 0],
  ['index', 1],
  ['first', true]
]));
if ((typeof context.get('_seq') === 'object') && this.isCountable(context.get('_seq'))) {
    let length = this.count(context.get('_seq'));
    let loop = context.get('loop');
    loop.set('revindex0', length - 1);
    loop.set('revindex', length);
    loop.set('length', length);
    loop.set('last', (length === 1));
}
await this.iterate(context.get('_seq'), async (__key__, __value__) => {
    context.proxy[\`k\`] = __key__;
    context.proxy[\`v\`] = __value__;
    outputBuffer.echo((context.has(\`foo\`) ? context.get(\`foo\`) : null));
    (() => {
        let loop = context.get('loop');
        loop.set('index0', loop.get('index0') + 1);
        loop.set('index', loop.get('index') + 1);
        loop.set('first', false);
        if (loop.has('length')) {
            loop.set('revindex0', loop.get('revindex0') - 1);
            loop.set('revindex', loop.get('revindex') - 1);
            loop.set('last', loop.get('revindex0') === 0);
        }
    })();
});
(() => {
    let parent = context.get('_parent');
    context.delete('_seq');
    context.delete('_iterated');
    context.delete('k');
    context.delete('v');
    context.delete('_parent');
    context.delete('loop');
    for (let [k, v] of parent) {
        if (!context.has(k)) {
            context.set(k, v);
        }
    }
})();
`);

            end();
        });

        test('with ifexpr', ({same, end}) => {
            const keyTarget = createAssignNameNode('k', 1, 1);
            const valueTarget = createAssignNameNode('v', 1, 1);
            const sequence = createNameNode('items', 1, 1);
            const ifExpression = createConstantNode(true, 1, 1);

            const body = createBaseNode(null, {}, {
                0: createPrintNode(createNameNode('foo', 1, 1), 1, 1)
            }, 1, 1);
            const elseNode = null;

            const node = createForNode(keyTarget, valueTarget, sequence, ifExpression, body, elseNode, 1, 1);

            node.attributes.with_loop = true;

            same(compiler.compile(node).source, `context.set('_parent', context.clone());

await (async () => {
    let c = this.ensureTraversable((context.has(\`items\`) ? context.get(\`items\`) : null));

    if (c === context) {
        context.set('_seq', context.clone());
    }
    else {
        context.set('_seq', c);
    }
})();

context.set('loop', new Map([
  ['parent', context.get('_parent')],
  ['index0', 0],
  ['index', 1],
  ['first', true]
]));
await this.iterate(context.get('_seq'), async (__key__, __value__) => {
    context.proxy[\`k\`] = __key__;
    context.proxy[\`v\`] = __value__;
    if (this.evaluate(true)) {
        outputBuffer.echo((context.has(\`foo\`) ? context.get(\`foo\`) : null));
        (() => {
            let loop = context.get('loop');
            loop.set('index0', loop.get('index0') + 1);
            loop.set('index', loop.get('index') + 1);
            loop.set('first', false);
        })();
    }
});
(() => {
    let parent = context.get('_parent');
    context.delete('_seq');
    context.delete('_iterated');
    context.delete('k');
    context.delete('v');
    context.delete('_parent');
    context.delete('loop');
    for (let [k, v] of parent) {
        if (!context.has(k)) {
            context.set(k, v);
        }
    }
})();
`);

            end();
        });

        test('with else', ({same, end}) => {
            const keyTarget = createAssignNameNode('k', 1, 1);
            const valueTarget = createAssignNameNode('v', 1, 1);
            const sequence = createNameNode('items', 1, 1);
            const ifExpression = null;
            const body = createBaseNode(null, {}, {
                0: createPrintNode(createNameNode('foo', 1, 1), 1, 1)
            }, 1, 1);
            const elseNode = createPrintNode(createNameNode('foo', 1, 1), 1, 1);
            const node = createForNode(keyTarget, valueTarget, sequence, ifExpression, body, elseNode, 1, 1);

            node.attributes.with_loop = true;

            same(compiler.compile(node).source, `context.set('_parent', context.clone());

await (async () => {
    let c = this.ensureTraversable((context.has(\`items\`) ? context.get(\`items\`) : null));

    if (c === context) {
        context.set('_seq', context.clone());
    }
    else {
        context.set('_seq', c);
    }
})();

context.set('_iterated', false);
context.set('loop', new Map([
  ['parent', context.get('_parent')],
  ['index0', 0],
  ['index', 1],
  ['first', true]
]));
if ((typeof context.get('_seq') === 'object') && this.isCountable(context.get('_seq'))) {
    let length = this.count(context.get('_seq'));
    let loop = context.get('loop');
    loop.set('revindex0', length - 1);
    loop.set('revindex', length);
    loop.set('length', length);
    loop.set('last', (length === 1));
}
await this.iterate(context.get('_seq'), async (__key__, __value__) => {
    context.proxy[\`k\`] = __key__;
    context.proxy[\`v\`] = __value__;
    outputBuffer.echo((context.has(\`foo\`) ? context.get(\`foo\`) : null));
    context.set('_iterated',  true);
    (() => {
        let loop = context.get('loop');
        loop.set('index0', loop.get('index0') + 1);
        loop.set('index', loop.get('index') + 1);
        loop.set('first', false);
        if (loop.has('length')) {
            loop.set('revindex0', loop.get('revindex0') - 1);
            loop.set('revindex', loop.get('revindex') - 1);
            loop.set('last', loop.get('revindex0') === 0);
        }
    })();
});
if (context.get('_iterated') === false) {
    outputBuffer.echo((context.has(\`foo\`) ? context.get(\`foo\`) : null));
}
(() => {
    let parent = context.get('_parent');
    context.delete('_seq');
    context.delete('_iterated');
    context.delete('k');
    context.delete('v');
    context.delete('_parent');
    context.delete('loop');
    for (let [k, v] of parent) {
        if (!context.has(k)) {
            context.set(k, v);
        }
    }
})();
`);

            end();
        });
    });
});
