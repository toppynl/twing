import type {TwingFilter, TwingSynchronousFilter} from "../filter";

/**
 * Get a filter by name.
 *
 * @param {string} name The filter name
 *
 * @return {TwingFilter|false} A TwingFilter instance or false if the filter does not exist
 */
export const getFilter = <Filter extends TwingFilter | TwingSynchronousFilter>(
    filters: Map<string, Filter>,
    name: string
): Filter | null => {
    const result = filters.get(name);

    if (result) {
        return result;
    }

    for (let [pattern, filter] of filters) {
        let count: number = 0;

        pattern = pattern.replace(/\*/g, function () {
            count++;

            return '(.*?)';
        });

        if (count) {
            const regExp = new RegExp('^' + pattern + '$', 'g');
            const match = regExp.exec(name);
            const matches: Array<string> = [];

            if (match) {
                for (let i = 1; i <= count; i++) {
                    matches.push(match[i]);
                }

                filter.nativeArguments = matches;

                return filter;
            }
        }
    }

    return null;
};
