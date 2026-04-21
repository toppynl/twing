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
        // empty Map → not a mapping (matches PHP Twig: empty collection is always a sequence)
        return false;
    }

    return false;
};

/**
 * Checks if a variable is a mapping (associative array / hash).
 *
 * <pre>
 * {# evaluates to true if the foo variable is a mapping (non-sequential Map) #}
 * {% if foo is mapping %}
 *     {# ... #}
 * {% endif %}
 * </pre>
 *
 * @param value A variable
 *
 * @return {Promise<boolean>} true if the value is a mapping
 */
export const isMapping: TwingCallable<[value: any], boolean> = (_executionContext, value) => {
    return Promise.resolve(checkMapping(value));
};

export const isMappingSynchronously: TwingSynchronousCallable<[value: any], boolean> = (_executionContext, value) => {
    return checkMapping(value);
};
