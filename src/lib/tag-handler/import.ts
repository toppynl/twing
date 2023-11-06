import {createAssignNameNode} from "../node/expression/assign-name";
import {createImportNode} from "../node/import";
import {TokenType} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

export const createImportTagHandler = (): TwingTagHandler => {
    const tag = 'import';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const macro = parser.parseExpression(stream);

                stream.expect(TokenType.NAME, 'as');
                
                const alias = createAssignNameNode(stream.expect(TokenType.NAME).value, token.line, token.column);

                stream.expect(TokenType.TAG_END);
                parser.addImportedSymbol('template', alias.attributes.name);

                return createImportNode(macro, alias, parser.isMainScope(), token.line, token.column, tag);
            };
        }
    };
};
