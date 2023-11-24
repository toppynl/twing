/**
 * Lexes a template string.
 */
import {Lexer, TokenType} from "twig-lexer";
import {TwingTokenStream, createTokenStream} from "./token-stream";
import {createParsingError} from "./error/parsing";
import type {TwingOperator} from "./operator";
import type {TwingSource} from "./source";
import {SyntaxError} from "twig-lexer/dist/types/lib/SyntaxError";

export const typeToEnglish = (type: TokenType): string => {
    switch (type) {
        case "EOF":
            return 'end of template';
        case "TEXT":
            return 'text';
        case "TAG_START":
            return 'begin of statement block';
        case "VARIABLE_START":
            return 'begin of print statement';
        case "TAG_END":
            return 'end of statement block';
        case "VARIABLE_END":
            return 'end of print statement';
        case "NAME":
            return 'name';
        case "NUMBER":
            return 'number';
        case "STRING":
            return 'string';
        case "OPERATOR":
            return 'operator';
        case "PUNCTUATION":
            return 'punctuation';
        case "INTERPOLATION_START":
            return 'begin of string interpolation';
        case "INTERPOLATION_END":
            return 'end of string interpolation';
        case "COMMENT_START":
            return 'begin of comment statement';
        case "COMMENT_END":
            return 'end of comment statement';
        case "ARROW":
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

    tokenizeSource(source: TwingSource): TwingTokenStream {
        try {
            const tokens = this.tokenize(source.code);

            return createTokenStream(tokens, source);
        } catch (error: any) {
            const {message, line, column} = (error as SyntaxError);

            throw createParsingError(message, {line, column}, source.resolvedName, error);
        }
    }
}

export const createLexer = (
    binaryOperators: Map<string, TwingOperator>,
    unaryOperators: Map<string, TwingOperator>
): TwingLexer => {
    return new TwingLexer(binaryOperators, unaryOperators);
};
