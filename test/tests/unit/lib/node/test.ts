import * as tape from 'tape';
import {TwingNode} from "../../../../../src/lib/node";

tape('token', ({test}) => {
    test('should provide textual representation', ({same, end}) => {
        let node = new TwingNode(new Map([
            ['foo', new TwingNode(new Map(), new Map(), 2, 1, 'foo')]
        ]), new Map([
            ['foo-attr', new TwingNode(new Map(), new Map(), 2, 1, 'bar')]
        ]), 1, 1, 'foo');

        same(node.toString(), `TwingNode(foo-attr: TwingNode(line: 2, column: 1), line: 1, column: 1
  foo: TwingNode(line: 2, column: 1)
)`);

        end();
    });

    test('clone', ({same, end, notEquals}) => {
        let childNode = new TwingNode();
        let childAttribute = new TwingNode();
        let node = new TwingNode(new Map([[0, childNode]]), new Map([['foo', childAttribute]]));
        let clone = node.clone();

        notEquals(clone, node);
        notEquals(clone.getNode(0), childNode);
        notEquals(clone.getAttribute('foo'), childAttribute);
        same(clone.line, node.line);
        same(clone.column, node.column);
        same(clone.type, node.type);
        same(clone.getNodeTag(), node.getNodeTag());

        end();
    });

    test('getAttribute', ({same, end, fail}) => {
        let node = new TwingNode();

        try {
            node.getAttribute('foo');

            fail();
        }
        catch (e) {
            same(e.message, 'Attribute "foo" does not exist for Node "TwingNode".');
        }

        end();
    });

    test('removeAttribute', ({same, end}) => {
        let node = new TwingNode(new Map(), new Map([['foo', new TwingNode()]]));

        node.removeAttribute('foo');

        same(node.hasAttribute('foo'), false);

        end();
    });

    test('getNode', ({same, end, fail}) => {
        let node = new TwingNode();

        try {
            node.getNode(0);

            fail();
        }
        catch (e) {
            same(e.message, 'Node "0" does not exist for Node "TwingNode".');
        }

        end();
    });

    test('toString', ({same, end}) => {
        let node = new TwingNode(new Map(), new Map([['foo', 'bar']]));

        same(node.toString(), 'TwingNode(foo: \'bar\', line: 0, column: 0)');

        end();
    });
});
