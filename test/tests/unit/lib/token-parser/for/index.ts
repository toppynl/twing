import * as tape from 'tape';
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {ForTokenParser} from "../../../../../../src/lib/tag-handler/for";
import {createForNode} from "../../../../../../src/lib/node/for";
import {createAssignNameNode} from "../../../../../../src/lib/node/expression/assign-name";
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {createBaseNode} from "../../../../../../src/lib/node";
import {Token, TokenType} from "twig-lexer";
import {spy} from "sinon";

tape('ForTokenParser', (test) => {
    test.test('checkLoopUsageBody', (test) => {
        let stream = new TwingTokenStream([
            new Token(TokenType.TAG_END, null, 1, 1),
            new Token(TokenType.EOF, null, 1, 1)
        ]);

        let tokenParser = new ForTokenParser();

        let checkLoopUsageBody = Reflect.get(tokenParser, 'checkLoopUsageBody').bind(tokenParser);
        let checkLoopUsageBodySpy = spy(tokenParser, 'checkLoopUsageBody' as any);

        checkLoopUsageBody(stream, createForNode(createAssignNameNode('foo', 1, 1), createAssignNameNode('bar', 1, 1), createConstantNode(1, 1, 1), createConstantNode(1, 1, 1), createBaseNode(null), createBaseNode(null), 1, 1));

        test.true(checkLoopUsageBodySpy.notCalled);

        test.end();
    });

    test.end();
});
