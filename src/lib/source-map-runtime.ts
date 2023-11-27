import {TwingSource} from "./source";
import {TwingOutputBuffer} from "./output-buffer";
import {isAbsolute, relative} from "path";
import {RawSourceMap, SourceNode} from "source-map";

/**
 * source-map@0.6 definitions are wrong and source-map@0.7 has a bug that prevents it
 * from being used by browser runtimes (https://github.com/mozilla/source-map/issues/432)
 * we are stuck with source-map@0.6 so let's fix the definitions until 0.8 reaches stable state
 */
type TwingSourceNode = SourceNode & {
    children: Array<any>;
    add(chunk: string | TwingSourceNode): void;
};

export interface TwingSourceMapRuntime {
    readonly sourceMap: RawSourceMap;

    /**
     * @param {number} line 0-based
     * @param {number} column 1-based
     * @param {string} nodeType
     * @param {TwingSource} source
     * @param {TwingOutputBuffer} outputBuffer
     */
    enterSourceMapBlock(line: number, column: number, nodeType: string, source: TwingSource, outputBuffer: TwingOutputBuffer): void;

    leaveSourceMapBlock(outputBuffer: TwingOutputBuffer): void;
}

export const createSourceMapRuntime = (): TwingSourceMapRuntime => {
    let stack: Array<TwingSourceNode> = [
        new SourceNode() as TwingSourceNode
    ];

    return {
        get sourceMap() {
            const {map} = stack[0].toStringWithSourceMap();

            return JSON.parse(map.toString());
        },
        enterSourceMapBlock: (line, column, nodeType, source, outputBuffer) => {
            outputBuffer.start();

            let sourceName = source.resolvedName;

            if (isAbsolute(sourceName)) {
                sourceName = relative('.', sourceName);
            }

            const node = new SourceNode(line, column - 1, sourceName, '', nodeType) as TwingSourceNode;

            stack[0].setSourceContent(sourceName, source.code);

            stack.push(node);
        },
        leaveSourceMapBlock: (outputBuffer: TwingOutputBuffer) => {
            const sourceNode = stack.pop()!;
            const content = outputBuffer.getAndFlush();

            if (sourceNode.children.length === 0) {
                sourceNode.add(content);
            }

            stack[stack.length - 1].add(sourceNode);
        }
    };
};
