import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";
import {isAMarkup} from "@toppynl/twing";

const describeType = (value: unknown): string => {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
};

const computeClasses = (args: unknown[]): string => {
    const classes: string[] = [];

    args.forEach((arg, i) => {
        if (typeof arg === "string" || isAMarkup(arg)) {
            classes.push(String(arg));
            return;
        }

        if (arg instanceof Map) {
            for (const [key, condition] of arg.entries()) {
                if (typeof key !== "string") {
                    throw new Error(
                        `The "html_classes" function argument ${i} (key ${String(key)}) should be a string, got "${describeType(key)}"`
                    );
                }

                if (!condition) {
                    continue;
                }

                classes.push(key);
            }
            return;
        }

        if (Array.isArray(arg)) {
            arg.forEach((_value, index) => {
                throw new Error(
                    `The "html_classes" function argument ${i} (key ${index}) should be a string, got "number"`
                );
            });
            return;
        }

        throw new Error(
            `The "html_classes" function argument ${i} should be either a string or an array, got "${describeType(arg)}"`
        );
    });

    const filtered = classes.filter((value) => value !== "");

    return Array.from(new Set(filtered)).join(" ");
};

export const htmlClasses: TwingCallable<unknown[], string> = async (_executionContext, ...args) => {
    return computeClasses(args);
};

export const htmlClassesSynchronously: TwingSynchronousCallable<unknown[], string> = (_executionContext, ...args) => {
    return computeClasses(args);
};
