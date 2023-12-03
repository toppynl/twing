import {DateTime, Duration} from "luxon";
import {formatDuration} from "../../../helpers/format-duration";
import {formatDateTime} from "../../../helpers/format-date-time";
import {date as createDate} from "../functions/date";
import {TwingCallable} from "../../../callable-wrapper";

/**
 * Converts a date to the given format.
 *
 * <pre>
 *   {{ post.published_at|date("m/d/Y") }}
 * </pre>
 *
 * @param executionContext
 * @param date A date
 * @param format The target format, null to use the default
 * @param timezone The target timezone, null to use the default, false to leave unchanged
 *
 * @return {Promise<string>} The formatted date
 */
export const date: TwingCallable = (
    executionContext,
    date: DateTime | Duration | string,
    format: string | null,
    timezone: string | null | false
): Promise<string> => {
    const {dateFormat, dateIntervalFormat} = executionContext;

    return createDate(executionContext, date, timezone)
        .then((date) => {
            if (date instanceof Duration) {
                if (format === null) {
                    format = dateIntervalFormat;
                }

                return Promise.resolve(formatDuration(date, format));
            }

            if (format === null) {
                format = dateFormat;
            }

            return Promise.resolve(formatDateTime(date, format));
        });
};
