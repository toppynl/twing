/**
 * Loops over each item of a sequence.
 *
 * <pre>
 * <ul>
 *  {% for user in users %}
 *    <li>{{ user.username|e }}</li>
 *  {% endfor %}
 * </ul>
 * </pre>
 */
import {getChildren, getChildrenCount, TwingNode} from "../node";
import {createParsingError} from "../error/parsing";
import {TwingTokenStream} from "../token-stream";
import {TwingAssignmentNode, createAssignmentNode} from "../node/expression/assignment";
import {createForNode} from "../node/for";
import {Token} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

export const createForTagHandler = (): TwingTagHandler => {
    const tag = 'for';

    const decideForFork = (token: Token) => {
        return token.test("NAME", ['else', 'endfor']);
    };

    const decideForEnd = (token: Token) => {
        return token.test("NAME", 'endfor');
    };

    // the loop variable cannot be used in the condition
    const checkLoopUsageCondition = (stream: TwingTokenStream, node: TwingNode) => {
        if ((node.is("get_attribute")) && (node.children.target.is("name")) && (node.children.target.attributes.name === 'loop')) {
            throw createParsingError('The "loop" variable cannot be used in a looping condition.', node, stream.source.resolvedName);
        }

        for (const [, child] of getChildren(node)) {
            checkLoopUsageCondition(stream, child)
        }
    };

    // check usage of non-defined loop-items
    // it does not catch all problems (for instance when a for is included into another or when the variable is used in an include)
    const checkLoopUsageBody = (stream: TwingTokenStream, node: TwingNode) => {
        if ((node.is("get_attribute")) && (node.children.target.is("name")) && (node.children.target.attributes.name === "loop")) {
            let attribute = node.children.attribute;

            if (attribute.is("constant") && (['length', 'revindex0', 'revindex', 'last'].indexOf(attribute.attributes.value as string) > -1)) {
                throw createParsingError(`The "loop.${attribute.attributes.value}" variable is not defined when looping with a condition.`, node, stream.source.resolvedName);
            }
        }

        // should check for parent.loop.XXX usage
        if (node.is("for")) {
            return;
        }

        for (let [, child] of getChildren(node)) {
            checkLoopUsageBody(stream, child);
        }
    };

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;
                const targets = parser.parseAssignmentExpression(stream);

                stream.expect("OPERATOR", 'in');

                let sequence = parser.parseExpression(stream);

                let ifExpression = null;

                if (stream.nextIf("NAME", 'if')) {
                    console.warn(`Using an "if" condition on "for" tag in "${stream.source.name}" at line ${line} is deprecated since Twig 2.10.0, use a "filter" filter or an "if" condition inside the "for" body instead (if your condition depends on a variable updated inside the loop).`);

                    ifExpression = parser.parseExpression(stream);
                }

                stream.expect("TAG_END");

                let body = parser.subparse(stream, tag, decideForFork);
                let elseToken;

                if (stream.next().value == 'else') {
                    stream.expect("TAG_END");
                    
                    elseToken = parser.subparse(stream, tag, decideForEnd);

                    stream.next();
                } else {
                    elseToken = null;
                }

                stream.expect("TAG_END");

                let keyTarget: TwingAssignmentNode;
                let valueTarget: TwingAssignmentNode;

                if (getChildrenCount(targets) > 1) {
                    keyTarget = targets.children[0];
                    keyTarget = createAssignmentNode(keyTarget.attributes.name, keyTarget.line, keyTarget.column);

                    valueTarget = targets.children[1];
                    valueTarget = createAssignmentNode(valueTarget.attributes.name, valueTarget.line, valueTarget.column);
                } else {
                    keyTarget = createAssignmentNode('_key', line, column);

                    valueTarget = targets.children[0];
                    valueTarget = createAssignmentNode(valueTarget.attributes.name, valueTarget.line, valueTarget.column);
                }

                if (ifExpression) {
                    checkLoopUsageCondition(stream, ifExpression);
                    checkLoopUsageBody(stream, body);
                }

                return createForNode(keyTarget, valueTarget, sequence, ifExpression, body, elseToken, line, column, tag);
            };
        }
    };
};
