import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {TwingCallable} from "../../../callable-wrapper";

export const reduce: TwingCallable = (_executionContext, map: any, callback: (accumulator: any, currentValue: any) => any, initial: any): Promise<string> => {
    map = iteratorToMap(map);

    const values: any[] = [...map.values()];
    
    return Promise.resolve(values.reduce((previousValue: any, currentValue: any): any => {
        return (async () => callback(await previousValue, currentValue))();
    }, initial));
};
