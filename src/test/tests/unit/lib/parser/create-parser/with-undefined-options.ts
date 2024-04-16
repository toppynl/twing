import * as tape from "tape";
import {createParser} from "../../../../../../main/lib/parser";
import {createSource} from "../../../../../../main/lib/source";
import {createLexer} from "../../../../../../main/lib/lexer";
import {createTokenStream} from "../../../../../../main/lib/token-stream";
import {createFilter} from "../../../../../../main/lib/filter";

tape('createParser', ({test}) => {
    test('with undefined options', ({test}) => {
        test('infers the specification level to 3', ({fail, same, end}) => {
            const parser = createParser(
                [],
                [],
                [],
                [],
                new Map(),
                new Map(),
                new Map()
            );

            const lexer = createLexer(2, [], []);
            const tokenStream = lexer.tokenizeSource(createSource('index', '{% filter foo %}{% endfilter %}'));

            try {
                parser.parse(createTokenStream(tokenStream.toAst(), tokenStream.source));

                fail();
            } catch (e) {
                same((e as Error).message, 'Unknown "filter" tag in "index" at line 1, column 4.');
            } finally {
                end();
            }
        });

        test('infers the strictness to true', ({fail, same, end}) => {
            const parser = createParser(
                [],
                [],
                [],
                [],
                new Map([
                    ['foo', createFilter('foo', () => Promise.resolve(), [])]
                ]),
                new Map(),
                new Map()
            );

            const lexer = createLexer(2, [], []);
            const tokenStream = lexer.tokenizeSource(createSource('index', '{% apply fo %}{% endapply %}'));

            try {
                parser.parse(createTokenStream(tokenStream.toAst(), tokenStream.source));

                fail();
            } catch (e) {
                same((e as Error).message, 'Unknown filter "fo". Did you mean "foo" in "index" at line 1, column 10?');
            } finally {
                end();
            }
        });
    });
});

