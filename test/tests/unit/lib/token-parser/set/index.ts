import * as tape from 'tape';
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {SetTokenParser} from "../../../../../../src/lib/token-parser/set";
import {getParser} from "../../../../../mock-builder/parser";
import {createBaseNode} from "../../../../../../src/lib/node";
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {Token, TokenType} from "twig-lexer";
import {stub} from "sinon";

tape('SetTokenParser', ({test}) => {
    test('parse', ({test}) => {
        test('when direct assignment', ({test}) => {
            test('when different number of variables and assignments', ({same, fail, end}) => {
                let stream = new TwingTokenStream([
                    new Token(TokenType.OPERATOR, '=', 1, 1),
                    new Token(TokenType.TAG_END, null, 1, 1),
                    new Token(TokenType.EOF, null, 1, 1)
                ]);

                let tokenParser = new SetTokenParser();
                let parser = getParser(stream);

                tokenParser.setParser(parser);

                stub(parser, 'parseAssignmentExpression').returns(createBaseNode(null, {}, {
                    0: createConstantNode('foo', 1, 1)
                }));
                stub(parser, 'parseMultitargetExpression').returns(createBaseNode(null, {}, {
                    0: createConstantNode('oof', 1, 1),
                    1: createConstantNode('bar', 1, 1)
                }));

                try {
                    tokenParser.parse(new Token(TokenType.NAME, 'set', 1, 1))

                    fail();
                } catch (e) {
                    same(e.message, 'When using set, you must have the same number of variables and assignments in "" at line 1.');
                }

                end();
            });
        });

        test('when capture', ({test}) => {
            test('when multiple targets', ({same, fail, end}) => {
                let stream = new TwingTokenStream([
                    new Token(TokenType.TAG_END, null, 1, 1),
                    new Token(TokenType.EOF, null, 1, 1)
                ]);

                let tokenParser = new SetTokenParser();
                let parser = getParser(stream);

                tokenParser.setParser(parser);

                stub(parser, 'parseAssignmentExpression').returns(createBaseNode(null, {}, {
                    0: createConstantNode('foo', 1, 1),
                    1: createConstantNode('bar', 1, 1)
                }));

                try {
                    tokenParser.parse(new Token(TokenType.NAME, 'set', 1, 1))

                    fail();
                } catch (e) {
                    same(e.message, 'When using set with a block, you cannot have a multi-target in "" at line 1.');
                }

                end();
            });
        });
    });
});
