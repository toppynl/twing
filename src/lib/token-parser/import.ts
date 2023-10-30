import {TokenParser} from "../token-parser";
import {createAssignNameNode} from "../node/expression/assign-name";
import {createImportNode} from "../node/import";
import {Token, TokenType} from "twig-lexer";

export class TwingTokenParserImport extends TokenParser {
    parse(token: Token) {
        let macro = this.parser.parseExpression();

        this.parser.getStream().expect(TokenType.NAME, 'as');

        // template alias
        let var_ = createAssignNameNode(this.parser.getStream().expect(TokenType.NAME).value, token.line, token.column);

        this.parser.getStream().expect(TokenType.TAG_END);
        this.parser.addImportedSymbol('template', var_.attributes.name);

        return createImportNode(macro, var_, this.parser.isMainScope(), token.line, token.column, this.getTag());
    }

    getTag() {
        return 'import';
    }
}
