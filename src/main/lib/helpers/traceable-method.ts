import {createRuntimeError} from "../error/runtime";
import type {TwingSource} from "../source";
import {isATwingError} from "../error";

export function getTraceableMethod<M extends (...args: Array<any>) => Promise<any>>(method: M, location: {
    line: number;
    column: number;
}, templateSource: TwingSource): M {
    return ((...args: Array<any>) => {
        return method(...args)
            .catch((error) => {
                if (!isATwingError(error)) {
                    throw createRuntimeError(error.message, location, templateSource, error);
                }

                throw error;
            });
    }) as typeof method;
}
