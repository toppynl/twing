import {DateTime, Duration} from "luxon";
import {modifyDate} from "../../../helpers/modify-date";
import {TwingRuntimeError} from "../../../error/runtime";
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
 * @param {Date | DateTime | Duration | number | string} date A date or null to use the current time
 * @param {string | null | boolean} timezone The target timezone, null to use the default, false to leave unchanged
 *
 * @returns {Promise<DateTime | Duration>}
 */
export const createDate = (
    template: TwingTemplate,
    date: Date | DateTime | number | string | null,
    timezone: string | null | false
): Promise<DateTime> => {
    const defaultTimezone = template.environment.getTimezone();
    
    let _do = (): DateTime => {
        let result: DateTime;

        // determine the timezone
        if (timezone !== false) {
            if (timezone === null) {
                timezone = defaultTimezone;
            }
        }

        if (date instanceof DateTime) {
            if (timezone !== false) {
                date = date.setZone(timezone);
            }

            return date;
        }

        let parsedUtcOffset = 0;

        if (!date) {
            result = DateTime.local();
        } else if (date instanceof Date) {
            result = DateTime.fromJSDate(date);
        } else if (typeof date === 'string') {
            if (date === 'now') {
                result = DateTime.local();
            } else {
                result = DateTime.fromISO(date, {
                    zone: defaultTimezone || undefined,
                    setZone: true
                });

                if (!result.isValid) {
                    result = DateTime.fromRFC2822(date, {
                        zone: defaultTimezone || undefined,
                        setZone: true
                    });
                }

                if (!result.isValid) {
                    result = DateTime.fromSQL(date, {
                        zone: defaultTimezone || undefined,
                        setZone: true
                    });
                }

                if (result.isValid) {
                    parsedUtcOffset = result.offset;
                } else {
                    result = modifyDate(date);
                }
            }
        } else {
            // date is PHP timestamp - i.e. in seconds
            let ts = date as number * 1000;

            // timestamp are UTC by definition
            result = DateTime.fromMillis(ts, {
                setZone: false
            });
        }

        if (!result || !result.isValid) {
            throw new TwingRuntimeError(`Failed to parse date "${date}".`);
        }

        if (timezone !== false) {
            result = result.setZone(timezone);
        } else {
            if (parsedUtcOffset) {
                // explicit UTC offset
                result = result.setZone(`UTC+${parsedUtcOffset / 60}`);
            }
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
