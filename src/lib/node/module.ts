import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import type {TwingSource} from "../source";
import {TwingBaseExpressionNode} from "./expression";
import {TwingTraitNode} from "./trait";
import {TwingMacroNode} from "./macro";
import {TwingBlockNode} from "./block";
import {TwingBodyNode} from "./body";

export type TwingModuleNodeAttributes = TwingBaseNodeAttributes & {
    index: number;
    source: TwingSource;
};

export type TwingModuleNodeChildren = {
    body: TwingBodyNode;
    blocks: TwingBaseNode<any, {}, Record<string, TwingBlockNode>>;
    macros: TwingBaseNode<any, {}, Record<string, TwingMacroNode>>;
    traits: TwingBaseNode<any, {}, Record<string, TwingTraitNode>>;
    securityCheck: TwingBaseNode;
    parent?: TwingBaseExpressionNode;
};

export interface TwingModuleNode extends TwingBaseNode<"module", TwingModuleNodeAttributes, TwingModuleNodeChildren> {
    readonly embeddedTemplates: Array<TwingModuleNode>;
    readonly source: TwingSource;
}

export const createModuleNode = (
    body: TwingModuleNode["children"]["body"],
    parent: TwingBaseExpressionNode | null,
    blocks: TwingModuleNode["children"]["blocks"],
    macros: TwingModuleNode["children"]["macros"],
    traits: TwingModuleNode["children"]["traits"],
    embeddedTemplates: Array<TwingModuleNode>,
    source: TwingSource,
    line: number,
    column: number
): TwingModuleNode => {
    const children: TwingModuleNode["children"] = {
        body,
        blocks,
        macros,
        traits,
        securityCheck: createBaseNode(null)
    };

    if (parent !== null) {
        children.parent = parent;
    }

    const baseNode = createBaseNode("module", {
        index: 0,
        source
    }, children, line, column);

    const moduleNode: TwingModuleNode = {
        ...baseNode,
        get embeddedTemplates() {
            return embeddedTemplates;
        },
        get source() {
            return source;
        },
        execute: (...args) => {
            const [template, , outputBuffer, , , sourceMapRuntime] = args;
            const {securityCheck, body} = moduleNode.children;

            return securityCheck.execute(...args)
                .then(() => {
                    sourceMapRuntime?.enterSourceMapBlock(moduleNode.line, moduleNode.column, moduleNode.type, template.source, outputBuffer);

                    return body.execute(...args).then(() => {
                        sourceMapRuntime?.leaveSourceMapBlock(outputBuffer);
                    });
                });
        }
    };

    return moduleNode;
};
