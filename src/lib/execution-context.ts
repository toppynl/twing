import type {TwingTemplate, TwingTemplateAliases, TwingTemplateBlockMap} from "./template";
import type {TwingContext} from "./context";
import type {TwingOutputBuffer} from "./output-buffer";
import type {TwingSourceMapRuntime} from "./source-map-runtime";
import type {TwingEnvironment} from "./environment";
import type {TwingNodeExecutor} from "./node-executor";
import type {TwingTemplateLoader} from "./template-loader";

export type TwingExecutionContext = {
    aliases: TwingTemplateAliases;
    blocks: TwingTemplateBlockMap;
    context: TwingContext<any, any>;
    environment: TwingEnvironment;
    nodeExecutor: TwingNodeExecutor;
    outputBuffer: TwingOutputBuffer;
    sandboxed: boolean;
    sourceMapRuntime?: TwingSourceMapRuntime;
    strict: boolean;
    template: TwingTemplate;
    templateLoader: TwingTemplateLoader;
};
