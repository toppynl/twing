/**
 * Lexes a template string.
 */
import {Lexer, TokenType} from "twig-lexer";
import {TwingTokenStream} from "./token-stream";
import {TwingParsingError} from "./error/parsing";
import type {TwingOperator} from "./operator";
import type {Source} from "./source";
import {SyntaxError} from "twig-lexer/dist/types/lib/SyntaxError";

export const typeToEnglish = (type: TokenType): string => {
    switch (type) {
        case TokenType.EOF:
            return 'end of template';
        case TokenType.TEXT:
            return 'text';
        case TokenType.TAG_START:
            return 'begin of statement block';
        case TokenType.VARIABLE_START:
            return 'begin of print statement';
        case TokenType.TAG_END:
            return 'end of statement block';
        case TokenType.VARIABLE_END:
            return 'end of print statement';
        case TokenType.NAME:
            return 'name';
        case TokenType.NUMBER:
            return 'number';
        case TokenType.STRING:
            return 'string';
        case TokenType.OPERATOR:
            return 'operator';
        case TokenType.PUNCTUATION:
            return 'punctuation';
        case TokenType.INTERPOLATION_START:
            return 'begin of string interpolation';
        case TokenType.INTERPOLATION_END:
            return 'end of string interpolation';
        case TokenType.COMMENT_START:
            return 'begin of comment statement';
        case TokenType.COMMENT_END:
            return 'end of comment statement';
        case TokenType.ARROW:
            return 'arrow function';
        default:
            throw new Error(`Token of type "${type}" does not exist.`)
    }
};

export class TwingLexer extends Lexer {
    constructor(
        binaryOperators: Map<string, TwingOperator>,
        unaryOperators: Map<string, TwingOperator>
    ) {
        super();
        
        // custom operators
        for (let operators of [binaryOperators, unaryOperators]) {
            for (let [key] of operators) {
                if (!this.operators.includes(key)) {
                    this.operators.push(key);
                }
            }
        }
    }

    tokenizeSource(source: Source): TwingTokenStream {
        try {
            const tokens = this.tokenize(source.code);

            return new TwingTokenStream(tokens, source);
        } catch (error: any) {
            throw new TwingParsingError((error as SyntaxError).message, (error as SyntaxError).line, source, error);
        }
    }
}
