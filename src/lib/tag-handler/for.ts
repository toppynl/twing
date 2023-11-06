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
import {getChildren, getChildrenCount, Node} from "../node";
import {TwingParsingError} from "../error/parsing";
import {TwingTokenStream} from "../token-stream";
import {AssignNameNode, createAssignNameNode} from "../node/expression/assign-name";
import {createForNode} from "../node/for";
import {Token, TokenType} from "twig-lexer";
import {TwingTagHandler} from "../tag-handler";

export const createForTagHandler = (): TwingTagHandler => {
    const tag = 'for';

    const decideForFork = (token: Token) => {
        return token.test(TokenType.NAME, ['else', 'endfor']);
    };

    const decideForEnd = (token: Token) => {
        return token.test(TokenType.NAME, 'endfor');
    };

    // the loop variable cannot be used in the condition
    const checkLoopUsageCondition = (stream: TwingTokenStream, node: Node) => {
        if ((node.is("get_attribute")) && (node.children.target.is("name")) && (node.children.target.attributes.name === 'loop')) {
            throw new TwingParsingError('The "loop" variable cannot be used in a looping condition.', node.line, stream.getSourceContext());
        }

        for (const [, child] of getChildren(node)) {
            checkLoopUsageCondition(stream, child)
        }
    };

    // check usage of non-defined loop-items
    // it does not catch all problems (for instance when a for is included into another or when the variable is used in an include)
    const checkLoopUsageBody = (stream: TwingTokenStream, node: Node) => {
        if ((node.is("get_attribute")) && (node.children.target.is("name")) && (node.children.target.attributes.name === "loop")) {
            let attribute = node.children.attribute;

            if (attribute.is("constant") && (['length', 'revindex0', 'revindex', 'last'].indexOf(attribute.attributes.value as string) > -1)) {
                throw new TwingParsingError(`The "loop.${attribute.attributes.value}" variable is not defined when looping with a condition.`, node.line, stream.getSourceContext());
            }
        }
        
        // should check for parent.loop.XXX usage
        if (node.is("for")) {
            return;
        }

        for (let [, n] of getChildren(node)) {
            checkLoopUsageBody(stream, n as any);
        }
    };

    return {
        tag,
        initialize: (parser) => {
            return (token, stream) => {
                const {line, column} = token;

                const targets = parser.parseAssignmentExpression(stream);

                stream.expect(TokenType.OPERATOR, 'in');

                let sequence = parser.parseExpression(stream);

                let ifExpression = null;

                if (stream.nextIf(TokenType.NAME, 'if')) {
                    console.warn(`Using an "if" condition on "for" tag in "${stream.getSourceContext().name}" at line ${line} is deprecated since Twig 2.10.0, use a "filter" filter or an "if" condition inside the "for" body instead (if your condition depends on a variable updated inside the loop).`);

                    ifExpression = parser.parseExpression(stream);
                }

                stream.expect(TokenType.TAG_END);

                let body = parser.subparse(stream, tag, decideForFork);
                let elseToken;

                if (stream.next().value == 'else') {
                    stream.expect(TokenType.TAG_END);
                    elseToken = parser.subparse(stream, tag, decideForEnd, true);
                } else {
                    elseToken = null;
                }

                stream.expect(TokenType.TAG_END);

                let keyTarget: AssignNameNode;
                let valueTarget: AssignNameNode;

                if (getChildrenCount(targets) > 1) {
                    keyTarget = targets.children[0];
                    keyTarget = createAssignNameNode(keyTarget.attributes.name, keyTarget.line, keyTarget.column);

                    valueTarget = targets.children[1];
                    valueTarget = createAssignNameNode(valueTarget.attributes.name, valueTarget.line, valueTarget.column);
                } else {
                    keyTarget = createAssignNameNode('_key', line, column);

                    valueTarget = targets.children[0];
                    valueTarget = createAssignNameNode(valueTarget.attributes.name, valueTarget.line, valueTarget.column);
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
