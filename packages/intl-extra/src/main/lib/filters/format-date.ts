import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";
import type {DateTime} from "luxon";

type DateStyle = 'none' | 'short' | 'medium' | 'long' | 'full';
const VALID_FORMATS: DateStyle[] = ['none', 'short', 'medium', 'long', 'full'];

const validateFormat = (format: string): void => {
    if (!VALID_FORMATS.includes(format as DateStyle)) {
        throw new Error(`"${format}" is not a valid date format, known formats are: "none", "short", "medium", "long", "full"`);
    }
};

const toDate = (value: DateTime | string | null | undefined): Date => {
    if (value === null || value === undefined) return new Date();
    if (typeof value === 'string') return new Date(value);
    return value.toJSDate();
};

const resolveLocale = (locale: string | null | undefined, prototype?: Intl.DateTimeFormat): string =>
    locale || prototype?.resolvedOptions().locale || new Intl.DateTimeFormat().resolvedOptions().locale;

const resolveTimezone = (
    timezone: string | false | null | undefined,
    prototype?: Intl.DateTimeFormat
): string | undefined => {
    if (timezone === false) return undefined;
    if (timezone === null || timezone === undefined) {
        return prototype?.resolvedOptions().timeZone;
    }
    return timezone as string;
};

const buildOptions = (
    dateFormat: string | null,
    timeFormat: string | null,
    timezone: string | false | null | undefined,
    calendar: string,
    dateFormatterPrototype?: Intl.DateTimeFormat
): Intl.DateTimeFormatOptions => {
    const options: Intl.DateTimeFormatOptions = {};

    if (dateFormat && dateFormat !== 'none') {
        options.dateStyle = dateFormat as Intl.DateTimeFormatOptions['dateStyle'];
    }
    if (timeFormat && timeFormat !== 'none') {
        options.timeStyle = timeFormat as Intl.DateTimeFormatOptions['timeStyle'];
    }

    const tz = resolveTimezone(timezone, dateFormatterPrototype);
    if (tz) options.timeZone = tz;

    if (calendar && calendar !== 'gregorian') {
        options.calendar = calendar;
    }

    return options;
};

const resolveDatetime = (
    value: DateTime | string | null,
    dateFormat: string,
    timeFormat: string,
    _pattern: string,
    timezone: string | false | null,
    calendar: string,
    locale: string | null | undefined,
    dateFormatterPrototype?: Intl.DateTimeFormat
): string => {
    validateFormat(dateFormat);
    validateFormat(timeFormat);

    const date = toDate(value);
    const resolvedLocale = resolveLocale(locale, dateFormatterPrototype);
    const options = buildOptions(dateFormat, timeFormat, timezone, calendar, dateFormatterPrototype);

    return new Intl.DateTimeFormat(resolvedLocale, options).format(date);
};

export const makeFormatDatetimeFilter = (dateFormatterPrototype?: Intl.DateTimeFormat): TwingCallable =>
    async (_ctx, value: DateTime | string | null, dateFormat = 'medium', timeFormat = 'medium', pattern = '', timezone: string | false | null = null, calendar = 'gregorian', locale?: string) =>
        resolveDatetime(value, dateFormat, timeFormat, pattern, timezone, calendar, locale, dateFormatterPrototype);

export const makeFormatDatetimeFilterSynchronously = (dateFormatterPrototype?: Intl.DateTimeFormat): TwingSynchronousCallable =>
    (_ctx, value: DateTime | string | null, dateFormat = 'medium', timeFormat = 'medium', pattern = '', timezone: string | false | null = null, calendar = 'gregorian', locale?: string) =>
        resolveDatetime(value, dateFormat, timeFormat, pattern, timezone, calendar, locale, dateFormatterPrototype);

export const makeFormatDateFilter = (dateFormatterPrototype?: Intl.DateTimeFormat): TwingCallable =>
    async (_ctx, value: DateTime | string | null, dateFormat = 'medium', pattern = '', timezone: string | false | null = null, calendar = 'gregorian', locale?: string) =>
        resolveDatetime(value, dateFormat, 'none', pattern, timezone, calendar, locale, dateFormatterPrototype);

export const makeFormatDateFilterSynchronously = (dateFormatterPrototype?: Intl.DateTimeFormat): TwingSynchronousCallable =>
    (_ctx, value: DateTime | string | null, dateFormat = 'medium', pattern = '', timezone: string | false | null = null, calendar = 'gregorian', locale?: string) =>
        resolveDatetime(value, dateFormat, 'none', pattern, timezone, calendar, locale, dateFormatterPrototype);

export const makeFormatTimeFilter = (dateFormatterPrototype?: Intl.DateTimeFormat): TwingCallable =>
    async (_ctx, value: DateTime | string | null, timeFormat = 'medium', pattern = '', timezone: string | false | null = null, calendar = 'gregorian', locale?: string) =>
        resolveDatetime(value, 'none', timeFormat, pattern, timezone, calendar, locale, dateFormatterPrototype);

export const makeFormatTimeFilterSynchronously = (dateFormatterPrototype?: Intl.DateTimeFormat): TwingSynchronousCallable =>
    (_ctx, value: DateTime | string | null, timeFormat = 'medium', pattern = '', timezone: string | false | null = null, calendar = 'gregorian', locale?: string) =>
        resolveDatetime(value, 'none', timeFormat, pattern, timezone, calendar, locale, dateFormatterPrototype);
