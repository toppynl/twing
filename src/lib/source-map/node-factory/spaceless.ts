import {TwingSourceMapNodeFactory} from "../node-factory";
import {TwingSourceMapNodeSpaceless} from "../node/spaceless";
import type {Source} from "../../source";

export class TwingSourceMapNodeFactorySpaceless extends TwingSourceMapNodeFactory {
    constructor() {
        super("spaceless");
    }

    create(line: number, column: number, source: Source): TwingSourceMapNodeSpaceless {
        return new TwingSourceMapNodeSpaceless(line, column, source);
    }
}
