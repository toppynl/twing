import type {TwingTokenParserInterface} from "./token-parser-interface";
import {TwingParser} from "./parser";
import type {Node} from "./node";
import type {Token} from "twig-lexer";

/**
 * Base class for all token parsers.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export abstract class TokenParser implements TwingTokenParserInterface {
    TwingTokenParserInterfaceImpl: TwingTokenParserInterface;

    constructor() {
        this.TwingTokenParserInterfaceImpl = this;
    }

    /**
     * @var TwingParser
     */
    protected parser: TwingParser;

    abstract parse(token: Token): Node | null;

    abstract getTag(): string;

    setParser(parser: TwingParser): void {
        this.parser = parser;
    }
}
