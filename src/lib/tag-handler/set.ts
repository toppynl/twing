import {TwingParsingError} from "../error/parsing";
import {createSetNode} from "../node/set";
import {TokenType} from "twig-lexer";
import {BaseNode, getChildrenCount} from "../node";
import {TwingTagHandler} from "../tag-handler";

export const createSetTagHandler = (): TwingTagHandler => {
    const tag = 'set';
    
    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;
                const names = parser.parseAssignmentExpression(stream);

                let capture = false;
                let values: BaseNode;

                if (stream.nextIf(TokenType.OPERATOR, '=')) {
                    values = parser.parseMultiTargetExpression(stream);

                    stream.expect(TokenType.TAG_END);

                    if (getChildrenCount(names) !== getChildrenCount(values)) {
                        throw new TwingParsingError('When using set, you must have the same number of variables and assignments.', stream.getCurrent().line, stream.getSourceContext());
                    }
                }
                else {
                    capture = true;

                    if (getChildrenCount(names) > 1) {
                        throw new TwingParsingError('When using set with a block, you cannot have a multi-target.', stream.getCurrent().line, stream.getSourceContext());
                    }

                    stream.expect(TokenType.TAG_END);

                    values = parser.subparse(stream, tag, (token) => {
                        return token.test(TokenType.NAME, 'endset');
                    }, true);

                    stream.expect(TokenType.TAG_END);
                }

                return createSetNode(capture, names, values, line, column, tag);
            }
        }
    }  
};
