import {DateTime} from "luxon";
import {createDate} from "../functions/date";
import {TwingCallable} from "../../../callable-wrapper";

/**
 * Returns a new date object modified.
 *
 * <pre>
 *   {{ post.published_at|date_modify("-1day")|date("m/d/Y") }}
 * </pre>
 *
 * @param {TwingTemplate} template
 * @param {DateTime|string} date A date
 * @param {string} modifier A modifier string
 *
 * @returns {Promise<DateTime>} A new date object
 */
export const dateModify: TwingCallable = (
    executionContext,
    date: Date | DateTime | string,
    modifier: string
): Promise<DateTime> => {
    const {environment} = executionContext;
    const {timezone: defaultTimezone} = environment;

    return createDate(defaultTimezone, date, null)
        .then((dateTime) => {
            let regExp = new RegExp(/(\+|-)([0-9])(.*)/);
            let parts = regExp.exec(modifier)!;

            let operator: string = parts[1];
            let operand: number = Number.parseInt(parts[2]);
            let unit: string = parts[3].trim();

            let duration: any = {};

            duration[unit] = operator === '-' ? -operand : operand;

            dateTime = dateTime.plus(duration);

            return dateTime;
        });
};
