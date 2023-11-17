export type PrimitiveEscapingStrategy = "name" | "html" | "css" | "js" | string | false;
export type PrimitiveEscapingStrategyResolver = (name: string) => PrimitiveEscapingStrategy;

export type EscapingStrategyResolver = (templateName: string) => string | null;


export type EscapingStrategy = string | null | true; // todo: remove true

export type EscapingStrategyHandler = (value: string, charset: string, templateName: string) => string;
