import type {TwingParser} from "./parser";
import type {Node} from "./node";
import type {Token} from "twig-lexer";

/**
 * Interface implemented by token parsers.
 *
 * @author Eric MORAND <eric.morand@gmail.com>
 */
export interface TwingTokenParserInterface {
    TwingTokenParserInterfaceImpl: TwingTokenParserInterface;

    /**
     * Sets the parser associated with this token parser.
     */
    setParser(parser: TwingParser): void;

    /**
     * Parses a token and returns a node.
     */
    parse(token: Token): Node | null;

    /**
     * Gets the tag name associated with this token parser.
     *
     * @return string The tag name
     */
    getTag(): string;
}
