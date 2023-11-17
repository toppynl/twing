import {SourceNode} from "source-map";
import {TwingSource} from "../source";

export interface TwingSourceMapNode {
    parent: TwingSourceMapNode | null;

    addChild(child: TwingSourceMapNode): void;

    setContent(value: string): void;
    
    toSourceNode(): SourceNode;
}

export const createSourceMapNode = (
    line: number,
    column: number,
    source: TwingSource,
    name: string
): TwingSourceMapNode => {
    const children: Array<TwingSourceMapNode> = [];

    let parent: TwingSourceMapNode | null = null;
    let content: string;

    const sourceMapNode: TwingSourceMapNode = {
        get parent() {
            return parent;
        },
        set parent(value) {
            parent = value;
        },
        addChild: (child) => {
            child.parent = sourceMapNode;

            children.push(child);
        },
        setContent(value: string) {
            content = value;
        },
        toSourceNode(): SourceNode {
            let chunks: string | SourceNode | (string | SourceNode)[] | null = null;

            if (children.length === 0) {
                chunks = content;
            }

            // source-map@6 types are faulty, we have to force-type chunks as any
            const sourceNode = new SourceNode(line, column, source.name, chunks as any, name);

            sourceNode.setSourceContent(source.name, source.code);

            for (const child of children) {
                sourceNode.add(child.toSourceNode() as any);
            }

            return sourceNode;
        }
    };

    return sourceMapNode;
};
