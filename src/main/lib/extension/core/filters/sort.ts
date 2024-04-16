import {isTraversable} from "../../../helpers/is-traversable";
import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {asort} from "../../../helpers/asort";
import {TwingCallable} from "../../../callable-wrapper";

/**
 * Sorts an iterable.
 *
 * @param _executionContext
 * @param iterable
 * @param arrow
 *
 * @returns {Promise<Map<any, any>>}
 */
export const sort: TwingCallable<[
    iterable: any,
    arrow: ((a: any, b: any) => Promise<-1 | 0 | 1>) | null
], Map<any, any>> = async (_executionContext, iterable, arrow)=> {
    if (!isTraversable(iterable)) {
        return Promise.reject(new Error(`The sort filter only works with iterables, got "${typeof iterable}".`));
    }

    const map = iteratorToMap(iterable);
    
    await asort(map, arrow || undefined);
    
    return map;
};
