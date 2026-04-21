import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

/**
 * Checks if a variable is a sequence (0-indexed sequential array).
 *
 * <pre>
 * {# evaluates to true if the foo variable is a sequence #}
 * {% if foo is sequence %}
 *     {# ... #}
 * {% endif %}
 * </pre>
 *
 * @param value A variable
 *
 * @return {Promise<boolean>} true if the value is a sequence
 */

const checkSequence = (value: any): boolean => {
    if (Array.isArray(value)) {
        return true;
    }

    if (value instanceof Map) {
        let i = 0;
        for (const key of value.keys()) {
            if (key !== i++) {
                return false;
            }
        }
        return true;
    }

    return false;
};

export const isSequence: TwingCallable<[value: any], boolean> = (_executionContext, value) => {
    return Promise.resolve(checkSequence(value));
};

export const isSequenceSynchronously: TwingSynchronousCallable<[value: any], boolean> = (_executionContext, value) => {
    return checkSequence(value);
};
