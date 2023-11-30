import {TwingTemplate, TwingTemplateAliases, TwingTemplateBlockMap} from "./template";
import {TwingContext} from "./context";
import {TwingOutputBuffer} from "./output-buffer";
import {TwingSourceMapRuntime} from "./source-map-runtime";

export type TwingNodeExecutionContext = {
    aliases: TwingTemplateAliases;
    blocks: TwingTemplateBlockMap;
    context: TwingContext<any, any>;
    sandboxed: boolean;
    outputBuffer: TwingOutputBuffer;
    sourceMapRuntime?: TwingSourceMapRuntime;
    template: TwingTemplate;
};
