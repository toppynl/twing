import {DateTime, Duration} from "luxon";
import {formatDuration} from "../../../helpers/format-duration";
import {formatDateTime} from "../../../helpers/format-date-time";
import {date as createDate, dateSynchronously as createDateSynchronously} from "../functions/date";
import {TwingCallable, TwingSynchronousCallable} from "../../../callable-wrapper";

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
    const {environment} = executionContext;
    const {dateFormat, dateIntervalFormat} = environment;

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

export const dateFilterSynchronously: TwingSynchronousCallable = (
    executionContext,
    date: DateTime | Duration | string,
    format: string | null,
    timezone: string | null | false
): string => {
    const {environment} = executionContext;
    const {dateFormat, dateIntervalFormat} = environment;

    const durationOrDateTime = createDateSynchronously(executionContext, date, timezone);

    if (durationOrDateTime instanceof Duration) {
        if (format === null) {
            format = dateIntervalFormat;
        }

        return formatDuration(durationOrDateTime, format);
    }

    if (format === null) {
        format = dateFormat;
    }

    return formatDateTime(durationOrDateTime, format);
};
