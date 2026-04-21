import {isTraversable} from "../../../helpers/is-traversable";
import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

const shuffleMap = (map: Map<any, any>): Map<any, any> => {
    const entries = [...map.entries()];

    for (let i = entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    // Re-index numeric keys (matches PHP array_values() behaviour)
    return new Map(entries.map(([, v], i) => [i, v]));
};

export const shuffle: TwingCallable<[iterable: any], Map<any, any> | string> = async (_executionContext, iterable) => {
    if (typeof iterable === 'string') {
        const chars = [...iterable];

        for (let i = chars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [chars[i], chars[j]] = [chars[j], chars[i]];
        }

        return chars.join('');
    }

    if (!isTraversable(iterable)) {
        return Promise.reject(new Error(`The shuffle filter only works with iterables, got "${typeof iterable}".`));
    }

    return shuffleMap(iteratorToMap(iterable));
};

export const shuffleSynchronously: TwingSynchronousCallable<[iterable: any], Map<any, any> | string> = (_executionContext, iterable) => {
    if (typeof iterable === 'string') {
        const chars = [...iterable];

        for (let i = chars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [chars[i], chars[j]] = [chars[j], chars[i]];
        }

        return chars.join('');
    }

    if (!isTraversable(iterable)) {
        throw new Error(`The shuffle filter only works with iterables, got "${typeof iterable}".`);
    }

    return shuffleMap(iteratorToMap(iterable));
};
