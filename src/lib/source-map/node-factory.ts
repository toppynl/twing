/**
 * @author Eric MORAND <eric.morand@gmail.com>
 */
import {TwingSourceMapNode} from "./node";
import type {Source} from "../source";

export class TwingSourceMapNodeFactory {
    private readonly _name: string;

    constructor(name: string) {
        this._name = name;
    }

    create(line: number, column: number, source: Source): TwingSourceMapNode {
        return new TwingSourceMapNode(line, column, source, this.nodeName);
    }

    get nodeName(): string {
        return this._name;
    }
}
