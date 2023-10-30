import * as tape from 'tape';
import {TwingTokenStream} from "../../../../../../src/lib/token-stream";
import {UseTokenParser} from "../../../../../../src/lib/token-parser/use";
import {getParser} from "../../../../../mock-builder/parser";
import {createConstantNode} from "../../../../../../src/lib/node/expression/constant";
import {Token, TokenType} from "twig-lexer";
import {stub} from "sinon";
import {createBaseNode, getChildrenCount} from "../../../../../../src/lib/node";
import {TraitNode} from "../../../../../../src/lib/node/trait";

tape('UseTokenParser', ({test}) => {
    test('parse', ({test}) => {
        test('when template name is not a "EXPRESSION_CONSTANT"', ({same, end, fail}) => {
            let stream = new TwingTokenStream([]);
            let tokenParser = new UseTokenParser();
            let parser = getParser(stream);

            tokenParser.setParser(parser);

            stub(parser, 'parseExpression').returns(createBaseNode(null));
            stub(stream, 'getCurrent').returns({
                line: 1
            });

            try {
                tokenParser.parse(new Token(TokenType.NAME, 'set', 1, 1));

                fail();
            } catch (e: any) {
                same(e.message, 'The template references in a "use" statement must be a string in "" at line 1.')
            }

            end();
        });

        test('when multiple aliases', ({equals, end}) => {
            let stream = new TwingTokenStream([
                new Token(TokenType.NAME, 'with', 1, 1),
                new Token(TokenType.NAME, 'bar', 1, 1),
                new Token(TokenType.NAME, 'as', 1, 1),
                new Token(TokenType.NAME, 'rab', 1, 1),
                new Token(TokenType.PUNCTUATION, ',', 1, 1),
                new Token(TokenType.NAME, 'foo', 1, 1),
                new Token(TokenType.NAME, 'as', 1, 1),
                new Token(TokenType.NAME, 'oof', 1, 1),
                new Token(TokenType.TAG_END, null, 1, 1),
                new Token(TokenType.EOF, null, 1, 1)
            ]);

            let tokenParser = new UseTokenParser();
            let parser = getParser(stream);

            tokenParser.setParser(parser);

            let trait: TraitNode;

            stub(parser, 'parseExpression').returns(createConstantNode('foo', 1, 1));
            stub(parser, 'addTrait').callsFake((node) => {
                trait = node;
            });

            tokenParser.parse(new Token(TokenType.NAME, 'set', 1, 1));

            equals(getChildrenCount(trait.children.targets), 2);

            end();
        });
    });
});
