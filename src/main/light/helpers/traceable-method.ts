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

export function getSynchronousTraceableMethod<M extends (...args: Array<any>) => any>(method: M, location: {
    line: number;
    column: number;
}, templateSource: TwingSource): M {
    return ((...args: Array<any>) => {
        try {
            return method(...args);
        } catch (error) {
            if (!isATwingError(error as Error)) {
                throw createRuntimeError((error as Error).message, location, templateSource, (error as Error));
            }

            throw error;
        }
    }) as typeof method;
}
