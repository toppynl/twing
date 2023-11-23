import {DateTime, Duration} from "luxon";
import {modifyDate} from "../../../helpers/modify-date";
import {createRuntimeError} from "../../../error/runtime";
import {TwingTemplate} from "../../../template";

/**
 * Converts an input to a DateTime instance.
 *
 * <pre>
 *    {% if date(user.created_at) < date('+2days') %}
 *      {# do something #}
 *    {% endif %}
 * </pre>
 *
 * @param {TwingTemplate} template
 * @param {Date | DateTime | Duration | number | string} input A date or null to use the current time
 * @param {string | null | boolean} timezone The target timezone, null to use the default, false to leave unchanged
 *
 * @returns {Promise<DateTime | Duration>}
 */
export const createDate = (
    template: TwingTemplate,
    input: Date | DateTime | number | string | null,
    timezone: string | null | false
): Promise<DateTime> => {
    const defaultTimezone = template.environment.timezone;
    
    const _do = (): DateTime => {
        let result: DateTime;

        if (input === null) {
            result = DateTime.local();
        }
        else if (typeof input === 'number') {
            result = DateTime.fromMillis(input * 1000);
        }
        else if (typeof input === 'string') {
            if (input === 'now') {
                result = DateTime.local();
            } else {
                result = DateTime.fromISO(input, {
                    setZone: true
                });

                if (!result.isValid) {
                    result = DateTime.fromRFC2822(input, {
                        setZone: true
                    });
                }

                if (!result.isValid) {
                    result = DateTime.fromSQL(input, {
                        setZone: true
                    });
                }

                if (!result.isValid && /^-{0,1}\d+$/.test(input)) {
                    result = DateTime.fromMillis(Number.parseInt(input) * 1000, {
                        setZone: true
                    });
                }

                if (!result.isValid) {
                    result = modifyDate(input);
                }
            }
        }
        else if (input instanceof DateTime) {
            result = input;
        }
        else {
            result = DateTime.fromJSDate(input);
        }

        if (!result || !result.isValid) {
            throw createRuntimeError(`Failed to parse date "${input}".`);
        }
        
        // now let's apply timezone
        // determine the timezone
        if (timezone !== false) {
            if (timezone === null) {
                timezone = defaultTimezone;
            }
            
            result = result.setZone(timezone);
        }
        
        // todo: why did we have this?
        // Reflect.set(result, 'format', (format: string) => {
        //     return formatDateTime(result, format);
        // });
        
        return result;
    };

    try {
        return Promise.resolve(_do());
    } catch (e) {
        return Promise.reject(e);
    }
}

export const date = (
    template: TwingTemplate,
    date: Date | DateTime | Duration | number | string | null,
    timezone: string | null | false
): Promise<DateTime | Duration> => {
    if (date instanceof Duration) {
        return Promise.resolve(date);
    }
    
    return createDate(template, date, timezone);
}
