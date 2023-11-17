import type {TwingCompiler} from "./compiler";
import type {TwingExpressionNode} from "./node/expression";
import type {TwingPrintNode} from "./node/output/print";
import type {TwingBlockReferenceNode} from "./node/output/block-reference";
import type {TwingTextNode} from "./node/output/text";
import type {TwingAutoEscapeNode} from "./node/auto-escape";
import type {TwingBodyNode} from "./node/body";
import type {TwingCheckSecurityNode} from "./node/check-security";
import type {TwingCheckToStringNode} from "./node/check-to-string";
import type {TwingCommentNode} from "./node/comment";
import type {TwingDeprecatedNode} from "./node/deprecated";
import type {TwingDoNode} from "./node/do";
import type {TwingEmbedNode} from "./node/include/embed";
import type {TwingIncludeNode} from "./node/include/include";
import type {TwingFlushNode} from "./node/flush";
import type {TwingForNode} from "./node/for";
import type {TwingForLoopNode} from "./node/for-loop";
import type {TwingImportNode} from "./node/import";
import type {TwingInlinePrintNode} from "./node/output/inline-print";
import type {TwingLineNode} from "./node/line";
import type {TwingMacroNode} from "./node/macro";
import type {TwingModuleNode} from "./node/module";
import type {TwingBlockNode} from "./node/block";
import type {TwingTraitNode} from "./node/trait";
import type {TwingSetNode} from "./node/set";
import type {TwingVerbatimNode} from "./node/output/verbatim";
import type {TwingSandboxNode} from "./node/sandbox";
import type {TwingSpacelessNode} from "./node/output/spaceless";
import type {TwingWithNode} from "./node/with";
import type {TwingIfNode} from "./node/if";
import type {TwingMethodCallNode} from "./node/expression/method-call";
import type {TwingEscapeNode} from "./node/expression/escape";

const var_export = require('locutus/php/var/var_export');

export type TwingNode =
    | TwingAutoEscapeNode
    | TwingBlockNode
    | TwingBlockReferenceNode
    | TwingBodyNode
    | TwingCheckSecurityNode
    | TwingCheckToStringNode
    | TwingCommentNode
    | TwingDeprecatedNode
    | TwingDoNode
    | TwingEmbedNode
    | TwingEscapeNode
    | TwingExpressionNode
    | TwingFlushNode
    | TwingForLoopNode
    | TwingForNode
    | TwingIfNode
    | TwingImportNode
    | TwingIncludeNode
    | TwingInlinePrintNode
    | TwingLineNode
    | TwingMacroNode
    | TwingMethodCallNode
    | TwingModuleNode
    | TwingPrintNode
    | TwingSandboxNode
    | TwingSetNode
    | TwingSpacelessNode
    | TwingTextNode
    | TwingTraitNode
    | TwingVerbatimNode
    | TwingWithNode
    ;

export type TwingNodeType<T> = T extends TwingBaseNode<infer Type, any, any> ? Type : never;
export type TwingNodeAttributes<T> = T extends TwingBaseNode<any, infer Attributes, any> ? Attributes : never;
export type TwingNodeChildren<T> = T extends TwingBaseNode<any, any, infer Children> ? Children : never;

export type TwingBaseNodeAttributes = Record<never, never>;
export type TwingBaseNodeChildren = Record<string, TwingBaseNode>;

export interface TwingBaseNode<
    Type extends string | null = any,
    Attributes extends TwingBaseNodeAttributes = TwingBaseNodeAttributes,
    Children extends TwingBaseNodeChildren = TwingBaseNodeChildren,
> {
    readonly attributes: Attributes;
    readonly children: Children;
    readonly column: number;
    readonly isACaptureNode: boolean;
    readonly isAnOutputNode: boolean;
    readonly line: number;
    readonly type: Type;
    
    compile(compiler: TwingCompiler): void;

    getNodeTag(): string | null;
    
    toString(): string; // todo: remove - move it to a development helper and check usage in the parser 

    is<Type extends string>(type: Type): this is TwingNode & {
        type: Type;
    };
}

type KeysOf<T> = T extends T ? keyof T : never;

export const getChildren = <
    T extends TwingBaseNode
>(node: T): Array<[KeysOf<TwingNodeChildren<T>>, TwingNodeChildren<T>[any]]> => {
    return Object.entries(node.children) as Array<[KeysOf<TwingNodeChildren<T>>, TwingNodeChildren<T>[any]]>;
};

export const getChildrenCount = (
    node: TwingBaseNode
): number => {
    return Object.keys(node.children).length;
};

export const createBaseNode = <
    Type extends string | null,
    Attributes extends TwingBaseNodeAttributes,
    Children extends TwingBaseNodeChildren
>(
    type: Type,
    attributes: Attributes = {} as Attributes,
    children: Children = {} as Children,
    line: number = 0,
    column: number = 0,
    tag: string | null = null
): TwingBaseNode<Type, Attributes, Children> => {
    const node: TwingBaseNode<Type, Attributes, Children> = {
        attributes,
        children,
        column,
        line,
        isACaptureNode: false,
        isAnOutputNode: false,
        getNodeTag: () => tag,
        compile: (compiler) => {
            for (const [, child] of getChildren(node)) {
                child.compile(compiler);
            }
        },
        is: (aType) => (aType as string) === node.type,
        toString: () => {
            const attributeRepresentations: Array<string> = [];

            const isANode = (candidate: any): candidate is TwingBaseNode => {
                return candidate &&
                    (candidate as TwingBaseNode).type !== undefined &&
                    (candidate as TwingBaseNode).attributes !== undefined &&
                    (candidate as TwingBaseNode).children !== undefined;
            };

            for (const [name, value] of Object.entries(node.attributes)) {
                const attributeRepresentation = isANode(value) ? value.toString() : String(var_export(value, true));
                attributeRepresentations.push(`${name}: ${attributeRepresentation.replace(/\n/g, '')}`);
            }

            attributeRepresentations.push(`line: ${line}`);
            attributeRepresentations.push(`column: ${column}`);

            const representation: Array<string> = [
                `Node<${node.type ? '"' + node.type + '"' : 'null'}, ${attributeRepresentations.join(', ')}> (`
            ];

            if (getChildrenCount(node)) {
                for (let [name, child] of getChildren(node)) {
                    const length = ('' + name).length + 4;
                    const nodeRepresentation: Array<string> = [];

                    for (let line of child.toString().split('\n')) {
                        nodeRepresentation.push(' '.repeat(length) + line);
                    }

                    representation.push(`  ${name}: ${nodeRepresentation.join('\n').trimLeft()}`);
                }

                representation.push(')');
            } else {
                representation[0] += ')';
            }

            return representation.join('\n');
        },
        type
    };

    return node;
};
