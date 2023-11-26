export type EscapingStrategyResolver = (templateName: string) => string | null;
export type EscapingStrategy = "css" | "html" | "html_attr" | "js" | "url" | string; // todo: remove true
export type EscapingStrategyHandler = (value: string, charset: string, templateName: string) => string;
