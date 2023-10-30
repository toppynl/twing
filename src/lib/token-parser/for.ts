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
import {TokenParser} from "../token-parser";
import {getChildren, getChildrenCount, Node} from "../node";
import {TwingErrorSyntax} from "../error/syntax";
import {TwingTokenStream} from "../token-stream";
import {createAssignNameNode} from "../node/expression/assign-name";
import {createForNode} from "../node/for";
import {Token, TokenType} from "twig-lexer";

export class ForTokenParser extends TokenParser {
    parse(token: Token) {
        let line = token.line;
        let column = token.column;
        let stream = this.parser.getStream();
        let targets = this.parser.parseAssignmentExpression();

        stream.expect(TokenType.OPERATOR, 'in');

        let seq = this.parser.parseExpression();

        let ifExpr = null;

        if (stream.nextIf(TokenType.NAME, 'if')) {
            console.warn(`Using an "if" condition on "for" tag in "${stream.getSourceContext().getName()}" at line ${line} is deprecated since Twig 2.10.0, use a "filter" filter or an "if" condition inside the "for" body instead (if your condition depends on a variable updated inside the loop).`);

            ifExpr = this.parser.parseExpression();
        }

        stream.expect(TokenType.TAG_END);

        let body = this.parser.subparse([this, this.decideForFork]);
        let elseToken;

        if (stream.next().value == 'else') {
            stream.expect(TokenType.TAG_END);
            elseToken = this.parser.subparse([this, this.decideForEnd], true);
        } else {
            elseToken = null;
        }

        stream.expect(TokenType.TAG_END);

        let keyTarget;
        let valueTarget;

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

        if (ifExpr) {
            this.checkLoopUsageCondition(stream, ifExpr);
            this.checkLoopUsageBody(stream, body);
        }

        return createForNode(keyTarget, valueTarget, seq, ifExpr, body, elseToken, line, column, this.getTag());
    }

    decideForFork(token: Token) {
        return token.test(TokenType.NAME, ['else', 'endfor']);
    }

    decideForEnd(token: Token) {
        return token.test(TokenType.NAME, 'endfor');
    }

    // the loop variable cannot be used in the condition
    checkLoopUsageCondition(stream: TwingTokenStream, node: Node) {
        if ((node.is("get_attribute")) && (node.children.target.is("name")) && (node.children.target.attributes.name === 'loop')) {
            throw new TwingErrorSyntax('The "loop" variable cannot be used in a looping condition.', node.line, stream.getSourceContext());
        }

        for (const [, child] of getChildren(node)) {
            this.checkLoopUsageCondition(stream, child)
        }
    }

    // check usage of non-defined loop-items

    getTag() {
        return 'for';
    }

    // it does not catch all problems (for instance when a for is included into another or when the variable is used in an include)
    private checkLoopUsageBody(stream: TwingTokenStream, node: Node) {
        if ((node.is("get_attribute")) && (node.children.target.is("name")) && (node.children.target.attributes.name === "loop")) {
            let attribute = node.children.attribute;

            if (attribute.is("expression_constant") && (['length', 'revindex0', 'revindex', 'last'].indexOf(attribute.attributes.value as string) > -1)) {
                throw new TwingErrorSyntax(`The "loop.${attribute.attributes.value}" variable is not defined when looping with a condition.`, node.line, stream.getSourceContext());
            }
        }

        // should check for parent.loop.XXX usage
        if (node.is("for")) {
            return;
        }

        for (let [, n] of getChildren(node)) {
            this.checkLoopUsageBody(stream, n as any);
        }
    }
}
