import type {TwingSource} from "./source";
import {createParsingError} from "./error/parsing";
import {Token, TokenStream, TokenType, astVisitor} from "twig-lexer";
import {typeToEnglish} from "./lexer";

export interface TwingTokenStream {
    readonly current: Token;
    readonly source: TwingSource;

    /**
     * Tests a token and returns it or throws a syntax error.
     *
     * @return {Token}
     */
    expect(type: TokenType, value?: Array<string> | string | number | null, message?: string | null): Token;

    injectTokens(tokens: Array<Token>): void;

    /**
     * Checks if end of stream was reached.
     *
     * @return boolean
     */
    isEOF(): boolean;

    look(number: number): Token;

    next(): Token;

    nextIf(primary: TokenType, secondary?: Array<string> | string): Token;

    test(type: TokenType, value?: string | number | string[]): boolean;

    toAst(): Array<Token>;
}

export const createTokenStream = (
    tokens: Array<Token>,
    source: TwingSource
): TwingTokenStream => {
    const stream = new TokenStream(tokens);

    const tokenStream: TwingTokenStream = {
        get current() {
            return stream.current;
        },
        get source() {
            return source;
        },
        injectTokens: (tokens) => {
            stream.injectTokens(tokens);
        },
        next: () => {
            return stream.next()
        },
        nextIf: (primary, secondary) => {
            return stream.nextIf(primary, secondary);
        },
        expect: (type, value = null, message = null) => {
            let token = tokenStream.current;

            if (!token.test(type, value || undefined)) {
                const {line, column} = token;
                
                throw createParsingError(
                    `${message ? message + '. ' : ''}Unexpected token "${typeToEnglish(token.type)}" of value "${token.value}" ("${typeToEnglish(type)}" expected${value ? ` with value "${value}"` : ''}).`,
                    {line, column},
                    source
                );
            }

            tokenStream.next();

            return token;
        },
        look: (number) => {
            return stream.look(number);
        },
        test: (type, value) => {
            return stream.test(type, value);
        },
        isEOF: () => {
            return tokenStream.current.type === "EOF";
        },
        toAst: () => {
            return stream.traverse((token: Token, stream: TokenStream) => {
                token = astVisitor(token, stream);

                if (token && token.test("TEST_OPERATOR")) {
                    token = new Token("OPERATOR", token.value, token.line, token.column);
                }

                return token;
            });
        }
    };

    return tokenStream;
};
