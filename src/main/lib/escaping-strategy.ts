export type TwingEscapingStrategyResolver = (templateName: string) => string | null;
export type TwingEscapingStrategy = "css" | "html" | "html_attr" | "js" | "url" | string; // todo: remove true
export type TwingEscapingStrategyHandler = (value: string, charset: string, templateName: string) => string;
