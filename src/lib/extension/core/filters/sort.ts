import {isTraversable} from "../../../helpers/is-traversable";
import {TwingErrorRuntime} from "../../../error/runtime";
import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {asort} from "../../../helpers/asort";

/**
 * Sorts an iterable.
 *
 * @param {Map<any, any>} iterable
 *
 * @returns {Promise<Map<any, any>>}
 */
export async function sort(
    iterable: Map<any, any>,
    arrow: ((a: any, b: any) => Promise<-1 | 0 | 1>) | null
): Promise<Map<any, any>> {
    if (!isTraversable(iterable)) {
        throw new TwingErrorRuntime(`The sort filter only works with iterables, got "${typeof iterable}".`);
    }

    let map = iteratorToMap(iterable);

    await asort(map, arrow || undefined);

    return Promise.resolve(map);
}
