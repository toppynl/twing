import {TwingSourceMapNodeFactory} from "../node-factory";
import {TwingSource} from "../../source";
import {TwingSourceMapNodeSpaceless} from "../node/spaceless";

export class TwingSourceMapNodeFactorySpaceless extends TwingSourceMapNodeFactory {
    constructor() {
        super("spaceless");
    }

    create(line: number, column: number, source: TwingSource): TwingSourceMapNodeSpaceless {
        return new TwingSourceMapNodeSpaceless(line, column, source);
    }
}
