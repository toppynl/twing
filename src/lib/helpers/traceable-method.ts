import {isATwingError} from "../error";
import {createRuntimeError} from "../error/runtime";

export function getTraceableMethod<M extends (...args: Array<any>) => Promise<any>>(method: M, line: number, column: number, templateName: string): M {
    return ((...args: Array<any>) => {
        return method(...args)
            .catch((error) => {
                if (isATwingError(error)) {
                    if (error.location === undefined) {
                        error.location = {line, column};
                        error.source = templateName;
                    }
                } else {
                    throw createRuntimeError(`An exception has been thrown during the rendering of a template ("${error.message}").`, {
                        line,
                        column
                    }, templateName, error);
                }

                throw error;
            });
    }) as typeof method;
}
