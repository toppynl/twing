import {DateTime, Duration} from "luxon";
import {formatDuration} from "../../../helpers/format-duration";
import {formatDateTime} from "../../../helpers/format-date-time";
import {date as createDate} from "../functions/date";
import {TwingTemplate} from "../../../template";

/**
 * Converts a date to the given format.
 *
 * <pre>
 *   {{ post.published_at|date("m/d/Y") }}
 * </pre>
 *
 * @param {TwingTemplate} template
 * @param {DateTime|Duration|string} date A date
 * @param {string|null} format The target format, null to use the default
 * @param {string|null|boolean} timezone The target timezone, null to use the default, false to leave unchanged
 *
 * @return {Promise<string>} The formatted date
 */
export const date = (
    template: TwingTemplate,
    date: DateTime | Duration | string,
    format: string | null,
    timezone: string | null | false
): Promise<string> => {
    return createDate(template, date, timezone)
        .then((date) => {
            const {environment} = template;

            if (date instanceof Duration) {
                if (format === null) {
                    format = environment.dateIntervalFormat;
                }

                return Promise.resolve(formatDuration(date, format));
            }

            if (format === null) {
                format = environment.dateFormat;
            }

            return Promise.resolve(formatDateTime(date, format));
        });
};
