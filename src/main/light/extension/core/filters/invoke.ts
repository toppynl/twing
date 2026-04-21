import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

export const invoke: TwingCallable = async (_executionContext, callable: (...args: any[]) => any, ...args: any[]): Promise<any> => {
    return callable(...args);
};

export const invokeSynchronously: TwingSynchronousCallable = (_executionContext, callable: (...args: any[]) => any, ...args: any[]): any => {
    return callable(...args);
};
