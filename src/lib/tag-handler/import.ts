import {createAssignmentNode} from "../node/expression/assignment";
import {createImportNode} from "../node/import";
import {TwingTagHandler} from "../tag-handler";

export const createImportTagHandler = (): TwingTagHandler => {
    const tag = 'import';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const macro = parser.parseExpression(stream);

                stream.expect("NAME", 'as');
                
                const alias = createAssignmentNode(stream.expect("NAME").value, token.line, token.column);

                stream.expect("TAG_END");
                parser.addImportedSymbol('template', alias.attributes.name);

                return createImportNode(macro, alias, parser.isMainScope(), token.line, token.column, tag);
            };
        }
    };
};
