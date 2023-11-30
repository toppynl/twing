import {createParsingError} from "../error/parsing";
import {createSetNode} from "../node/set";
import {TwingBaseNode, getChildrenCount} from "../node";
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
                let values: TwingBaseNode;

                if (stream.nextIf("OPERATOR", '=')) {
                    values = parser.parseMultiTargetExpression(stream);

                    stream.expect("TAG_END");

                    if (getChildrenCount(names) !== getChildrenCount(values)) {
                        const {line, column} = stream.current;
                        
                        throw createParsingError('When using set, you must have the same number of variables and assignments.', {line, column}, stream.source.name);
                    }
                }
                else {
                    capture = true;

                    if (getChildrenCount(names) > 1) {
                        const {line, column} = stream.current;

                        throw createParsingError('When using set with a block, you cannot have a multi-target.', {line, column}, stream.source.name);
                    }

                    stream.expect("TAG_END");

                    values = parser.subparse(stream, tag, (token) => {
                        return token.test("NAME", 'endset');
                    });

                    stream.next();
                    stream.expect("TAG_END");
                }

                return createSetNode(capture, names, values, line, column, tag);
            }
        }
    }  
};
