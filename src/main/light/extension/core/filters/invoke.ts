import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

export const invoke: TwingCallable = async (_executionContext, callable: (...args: any[]) => any, ...args: any[]): Promise<any> => {
    if (typeof callable !== 'function') {
        return Promise.reject(new Error(`The "invoke" filter expects a callable, got "${typeof callable}".`));
    }

    return callable(...args);
};

export const invokeSynchronously: TwingSynchronousCallable = (_executionContext, callable: (...args: any[]) => any, ...args: any[]): any => {
    if (typeof callable !== 'function') {
        throw new Error(`The "invoke" filter expects a callable, got "${typeof callable}".`);
    }

    return callable(...args);
};
