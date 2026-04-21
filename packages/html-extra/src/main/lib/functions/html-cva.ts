import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";
import {Cva} from "../cva";

type CvaArgs = [
    base?: string | string[] | null,
    variants?: Map<string, Map<string, string | string[]>>,
    compoundVariants?: Array<Map<string, string | string[]>>,
    defaultVariants?: Map<string, string>
];

const build = (args: CvaArgs): Cva => {
    const [base = [], variants = new Map(), compoundVariants = [], defaultVariants = new Map()] = args;
    return new Cva(base as any, variants as any, compoundVariants as any, defaultVariants as any);
};

export const htmlCva: TwingCallable<CvaArgs, Cva> = async (_executionContext, ...args) => {
    return build(args);
};

export const htmlCvaSynchronously: TwingSynchronousCallable<CvaArgs, Cva> = (_executionContext, ...args) => {
    return build(args);
};
