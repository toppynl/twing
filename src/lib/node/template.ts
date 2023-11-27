import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import type {TwingSource} from "../source";
import {TwingBaseExpressionNode} from "./expression";
import {TwingTraitNode} from "./trait";
import {TwingMacroNode} from "./macro";
import {TwingBlockNode} from "./block";
import {TwingBodyNode} from "./body";

export const templateNodeType = "template";

export type TwingTemplateNodeAttributes = TwingBaseNodeAttributes & {
    index: number;
    source: TwingSource;
};

export type TwingTemplateNodeChildren = {
    body: TwingBodyNode;
    blocks: TwingBaseNode<any, {}, Record<string, TwingBlockNode>>;
    macros: TwingBaseNode<any, {}, Record<string, TwingMacroNode>>;
    traits: TwingBaseNode<any, {}, Record<string, TwingTraitNode>>;
    securityCheck: TwingBaseNode;
    parent?: TwingBaseExpressionNode;
};

export interface TwingTemplateNode extends TwingBaseNode<typeof templateNodeType, TwingTemplateNodeAttributes, TwingTemplateNodeChildren> {
    readonly embeddedTemplates: Array<TwingTemplateNode>;
    readonly source: TwingSource;
}

export const createTemplateNode = (
    body: TwingTemplateNode["children"]["body"],
    parent: TwingBaseExpressionNode | null,
    blocks: TwingTemplateNode["children"]["blocks"],
    macros: TwingTemplateNode["children"]["macros"],
    traits: TwingTemplateNode["children"]["traits"],
    embeddedTemplates: Array<TwingTemplateNode>,
    source: TwingSource,
    line: number,
    column: number
): TwingTemplateNode => {
    const children: TwingTemplateNode["children"] = {
        body,
        blocks,
        macros,
        traits,
        securityCheck: createBaseNode(null)
    };

    if (parent !== null) {
        children.parent = parent;
    }

    const baseNode = createBaseNode(templateNodeType, {
        index: 0,
        source
    }, children, line, column);

    const templateNode: TwingTemplateNode = {
        ...baseNode,
        get embeddedTemplates() {
            return embeddedTemplates;
        },
        get source() {
            return source;
        },
        execute: (...args) => {
            const [template, , outputBuffer, , , sourceMapRuntime] = args;
            const {securityCheck, body} = templateNode.children;

            return securityCheck.execute(...args)
                .then(() => {
                    sourceMapRuntime?.enterSourceMapBlock(templateNode.line, templateNode.column, templateNode.type, template.source, outputBuffer);

                    return body.execute(...args).then(() => {
                        sourceMapRuntime?.leaveSourceMapBlock(outputBuffer);
                    });
                });
        }
    };

    return templateNode;
};
