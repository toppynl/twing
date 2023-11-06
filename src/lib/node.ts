import type {TwingCompiler} from "./compiler";
import type {ExpressionNode} from "./node/expression";
import type {PrintNode} from "./node/print";
import type {BlockReferenceNode} from "./node/block-reference";
import type {TextNode} from "./node/text";
import type {AutoEscapeNode} from "./node/auto-escape";
import type {BodyNode} from "./node/body";
import type {CheckSecurityNode} from "./node/check-security";
import type {CheckToStringNode} from "./node/check-to-string";
import type {CommentNode} from "./node/comment";
import type {DeprecatedNode} from "./node/deprecated";
import type {DoNode} from "./node/do";
import type {EmbedNode} from "./node/include/embed";
import type {IncludeNode} from "./node/include/include";
import type {FlushNode} from "./node/flush";
import type {ForNode} from "./node/for";
import type {ForLoopNode} from "./node/for-loop";
import type {ImportNode} from "./node/import";
import type {InlinePrintNode} from "./node/inline-print";
import type {LineNode} from "./node/line";
import type {MacroNode} from "./node/macro";
import type {ModuleNode} from "./node/module";
import type {BlockNode} from "./node/block";
import type {TraitNode} from "./node/trait";
import type {SetNode} from "./node/set";
import type {VerbatimNode} from "./node/verbatim";
import type {SandboxNode} from "./node/sandbox";
import type {SpacelessNode} from "./node/spaceless";
import type {WithNode} from "./node/with";
import type {IfNode} from "./node/if";

const var_export = require('locutus/php/var/var_export');

export type Node =
    | AutoEscapeNode
    | BlockNode
    | BlockReferenceNode
    | BodyNode
    | CheckSecurityNode
    | CheckToStringNode
    | CommentNode
    | DeprecatedNode
    | DoNode
    | EmbedNode
    | ExpressionNode
    | FlushNode
    | ForLoopNode
    | ForNode
    | IfNode
    | ImportNode
    | IncludeNode
    | InlinePrintNode
    | LineNode
    | MacroNode
    | ModuleNode
    | PrintNode
    | SandboxNode
    | SetNode
    | SpacelessNode
    | TextNode
    | TraitNode
    | VerbatimNode
    | WithNode
    ;

export type NodeType<T> = T extends BaseNode<infer Type, any, any> ? Type : never;
export type NodeAttributes<T> = T extends BaseNode<any, infer Attributes, any> ? Attributes : never;
export type NodeChildren<T> = T extends BaseNode<any, any, infer Children> ? Children : never;

export type BaseNodeAttributes = Record<never, never>;
export type BaseNodeChildren = Record<string, BaseNode>;

export interface BaseNode<
    Type extends string | null = any,
    Attributes extends BaseNodeAttributes = BaseNodeAttributes,
    Children extends BaseNodeChildren = BaseNodeChildren,
> {
    readonly attributes: Attributes;
    readonly children: Children;
    readonly column: number;
    readonly isACaptureNode: boolean;
    readonly isAnOutputNode: boolean;
    readonly line: number;
    readonly type: Type;
    
    compile(compiler: TwingCompiler, flags?: {
        isDefinedTest?: boolean;
        ignoreStrictCheck?: boolean;
        optimizable?: boolean;
    }): void;

    getNodeTag(): string | null;

    toString(): string;

    is<Type extends string>(type: Type): this is Node & {
        type: Type;
    };
}

type KeysOf<T> = T extends T ? keyof T : never;

export const getChildren = <
    T extends BaseNode
>(node: T): Array<[KeysOf<NodeChildren<T>>, NodeChildren<T>[any]]> => {
    return Object.entries(node.children) as Array<[KeysOf<NodeChildren<T>>, NodeChildren<T>[any]]>;
};

export const getChildrenCount = (
    node: BaseNode
): number => {
    return Object.keys(node.children).length;
};

export const createBaseNode = <
    Type extends string | null,
    Attributes extends BaseNodeAttributes,
    Children extends BaseNodeChildren
>(
    type: Type,
    attributes: Attributes = {} as Attributes,
    children: Children = {} as Children,
    line: number = 0,
    column: number = 0,
    tag: string | null = null
): BaseNode<Type, Attributes, Children> => {
    const node: BaseNode<Type, Attributes, Children> = {
        attributes,
        children,
        column,
        line,
        isACaptureNode: false,
        isAnOutputNode: false,
        getNodeTag: () => tag,
        compile: (compiler, flags) => {
            for (const [, child] of getChildren(node)) {
                child.compile(compiler, flags);
            }
        },
        is: (aType) => (aType as string) === node.type,
        toString: () => {
            const attributeRepresentations: Array<string> = [];

            const isANode = (candidate: any): candidate is BaseNode => {
                return candidate &&
                    (candidate as BaseNode).type !== undefined &&
                    (candidate as BaseNode).attributes !== undefined &&
                    (candidate as BaseNode).children !== undefined;
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
