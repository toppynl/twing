import {createImportNode} from "../node/import";
import {createAssignmentNode} from "../node/expression/assignment";
import {TwingTagHandler} from "../tag-handler";

/**
 * Imports macros.
 *
 * <pre>
 *   {% from 'forms.html' import forms %}
 * </pre>
 */
export const createFromTagHandler = (): TwingTagHandler => {
    const tag = 'from';

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const templateName = parser.parseExpression(stream);

                stream.expect("NAME", 'import');

                const targets: Map<string, string> = new Map();

                do {
                    let name = stream.expect("NAME").value;
                    let alias = name;

                    if (stream.nextIf("NAME", 'as')) {
                        alias = stream.expect("NAME").value;
                    }

                    targets.set(name, alias);

                    if (!stream.nextIf("PUNCTUATION", ',')) {
                        break;
                    }
                } while (true);

                stream.expect("TAG_END");

                const aliasNode = createAssignmentNode(parser.getVarName(), token.line, token.column);
                const importNode = createImportNode(templateName, aliasNode, true, token.line, token.column, tag);

                for (const [name, alias] of targets) {
                    parser.addImportedSymbol("method", alias, name, aliasNode);
                }
                
                return importNode;
            };
        }
    };
};
