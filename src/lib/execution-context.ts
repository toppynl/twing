import type {TwingTemplate, TwingTemplateAliases, TwingTemplateBlockMap} from "./template";
import type {TwingContext} from "./context";
import type {TwingOutputBuffer} from "./output-buffer";
import type {TwingSourceMapRuntime} from "./source-map-runtime";
import type {TwingNumberFormat} from "./environment";

export type TwingExecutionContext = {
    aliases: TwingTemplateAliases;
    blocks: TwingTemplateBlockMap;
    charset: string,
    context: TwingContext<any, any>;
    dateFormat: string;
    dateIntervalFormat: string;
    globals: TwingContext<string, any>;
    isStrictVariables: boolean;
    numberFormat: TwingNumberFormat;
    outputBuffer: TwingOutputBuffer;
    sandboxed: boolean;
    sourceMapRuntime?: TwingSourceMapRuntime;
    template: TwingTemplate;
    timezone: string;
};
