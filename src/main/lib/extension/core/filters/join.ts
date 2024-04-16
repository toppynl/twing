import {isTraversable} from "../../../helpers/is-traversable";
import {iteratorToArray} from "../../../helpers/iterator-to-array";
import {TwingCallable} from "../../../callable-wrapper";

/**
 * Joins the values to a string.
 *
 * The separator between elements is an empty string per default, you can define it with the optional parameter.
 *
 * <pre>
 *  {{ [1, 2, 3]|join('|') }}
 *  {# returns 1|2|3 #}
 *
 *  {{ [1, 2, 3]|join }}
 *  {# returns 123 #}
 * </pre>
 *
 * @param _executionContext
 * @param value A value
 * @param glue The separator
 * @param and The separator for the last pair
 *
 * @returns {Promise<string>} The concatenated string
 */
export const join: TwingCallable<[
    value: any,
    glue: string,
    and: string | null
], string> = (_executionContext, value, glue, and) => {
    const _do = (): string => {
        if ((value == null) || (value === undefined)) {
            return '';
        }

        if (isTraversable(value)) {
            value = iteratorToArray(value);

            // this is ugly, but we have to ensure that each element of the array is rendered as PHP would render it
            const safeValue = value.map((item: any) => {
                if (typeof item === 'boolean') {
                    return (item === true) ? '1' : ''
                }
                
                if (Array.isArray(item)) {
                    return 'Array';
                }

                return item;
            });

            if (and === null || and === glue) {
                return safeValue.join(glue);
            }

            if (safeValue.length === 1) {
                return safeValue[0];
            }

            return safeValue.slice(0, -1).join(glue) + and + safeValue[safeValue.length - 1];
        }

        return '';
    };

    return Promise.resolve(_do());
};
