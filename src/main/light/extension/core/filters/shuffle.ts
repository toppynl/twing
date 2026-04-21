import {isTraversable} from "../../../helpers/is-traversable";
import {iteratorToMap} from "../../../helpers/iterator-to-map";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

const shuffleMap = (map: Map<any, any>): Map<any, any> => {
    const entries = [...map.entries()];

    for (let i = entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    return new Map(entries);
};

export const shuffle: TwingCallable<[iterable: any], Map<any, any>> = async (_executionContext, iterable) => {
    if (!isTraversable(iterable)) {
        return Promise.reject(new Error(`The shuffle filter only works with iterables, got "${typeof iterable}".`));
    }

    return shuffleMap(iteratorToMap(iterable));
};

export const shuffleSynchronously: TwingSynchronousCallable<[iterable: any], Map<any, any>> = (_executionContext, iterable) => {
    if (!isTraversable(iterable)) {
        throw new Error(`The shuffle filter only works with iterables, got "${typeof iterable}".`);
    }

    return shuffleMap(iteratorToMap(iterable));
};
