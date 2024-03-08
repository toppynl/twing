import type {TwingTemplate, TwingTemplateAliases, TwingTemplateBlockMap} from "./template";
import type {TwingContext} from "./context";
import type {TwingOutputBuffer} from "./output-buffer";
import type {TwingSourceMapRuntime} from "./source-map-runtime";
import type {TwingNumberFormat} from "./environment";
import type {TwingNodeExecutor} from "./node-executor";

export type TwingExecutionContext = {
    aliases: TwingTemplateAliases;
    blocks: TwingTemplateBlockMap;
    charset: string,
    context: TwingContext<any, any>;
    dateFormat: string;
    dateIntervalFormat: string;
    isStrictVariables: boolean;
    nodeExecutor: TwingNodeExecutor;
    numberFormat: TwingNumberFormat;
    outputBuffer: TwingOutputBuffer;
    sandboxed: boolean;
    sourceMapRuntime?: TwingSourceMapRuntime;
    template: TwingTemplate;
    timezone: string;
};
