import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

const checkMapping = (value: any): boolean => {
    if (Array.isArray(value)) {
        return false;
    }

    if (value instanceof Map) {
        let i = 0;
        for (const key of value.keys()) {
            if (key !== i++) {
                return true;
            }
        }
        return false;
    }

    return false;
};

export const isMapping: TwingCallable<[value: any], boolean> = (_executionContext, value) => {
    return Promise.resolve(checkMapping(value));
};

export const isMappingSynchronously: TwingSynchronousCallable<[value: any], boolean> = (_executionContext, value) => {
    return checkMapping(value);
};
