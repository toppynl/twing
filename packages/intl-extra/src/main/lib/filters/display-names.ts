import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";

const getLocale = (locale: string | null | undefined): string => {
    if (locale) return locale.replace('_', '-');
    return new Intl.DateTimeFormat().resolvedOptions().locale;
};

export const countryName: TwingCallable = async (_ctx, value: string, locale?: string) => {
    try {
        const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'region'});
        const result = displayNames.of(value);
        if (!result || result === value) throw new Error();
        return result;
    } catch {
        throw new Error(`Unable to get the country name for "${value}"`);
    }
};

export const countryNameSynchronously: TwingSynchronousCallable = (_ctx, value: string, locale?: string) => {
    try {
        const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'region'});
        const result = displayNames.of(value);
        if (!result || result === value) throw new Error();
        return result;
    } catch {
        throw new Error(`Unable to get the country name for "${value}"`);
    }
};

export const currencyName: TwingCallable = async (_ctx, value: string, locale?: string) => {
    try {
        const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'currency'});
        const result = displayNames.of(value);
        if (!result || result === value) throw new Error();
        return result;
    } catch {
        throw new Error(`Unable to get the currency name for "${value}"`);
    }
};

export const currencyNameSynchronously: TwingSynchronousCallable = (_ctx, value: string, locale?: string) => {
    try {
        const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'currency'});
        const result = displayNames.of(value);
        if (!result || result === value) throw new Error();
        return result;
    } catch {
        throw new Error(`Unable to get the currency name for "${value}"`);
    }
};

export const currencySymbol: TwingCallable = async (_ctx, value: string, locale?: string) => {
    try {
        const parts = new Intl.NumberFormat([getLocale(locale)], {
            style: 'currency',
            currency: value,
            currencyDisplay: 'symbol'
        }).formatToParts(0);
        const symbol = parts.find(p => p.type === 'currency');
        if (!symbol) throw new Error();
        return symbol.value;
    } catch {
        throw new Error(`Unable to get the currency symbol for "${value}"`);
    }
};

export const currencySymbolSynchronously: TwingSynchronousCallable = (_ctx, value: string, locale?: string) => {
    try {
        const parts = new Intl.NumberFormat([getLocale(locale)], {
            style: 'currency',
            currency: value,
            currencyDisplay: 'symbol'
        }).formatToParts(0);
        const symbol = parts.find(p => p.type === 'currency');
        if (!symbol) throw new Error();
        return symbol.value;
    } catch {
        throw new Error(`Unable to get the currency symbol for "${value}"`);
    }
};

export const languageName: TwingCallable = async (_ctx, value: string, locale?: string) => {
    try {
        const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'language'});
        const result = displayNames.of(value);
        if (!result || result === value) throw new Error();
        return result;
    } catch {
        throw new Error(`Unable to get the language name for "${value}"`);
    }
};

export const languageNameSynchronously: TwingSynchronousCallable = (_ctx, value: string, locale?: string) => {
    try {
        const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'language'});
        const result = displayNames.of(value);
        if (!result || result === value) throw new Error();
        return result;
    } catch {
        throw new Error(`Unable to get the language name for "${value}"`);
    }
};

export const localeName: TwingCallable = async (_ctx, value: string, locale?: string) => {
    try {
        const normalized = value.replace('_', '-');
        const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'language'});
        const result = displayNames.of(normalized);
        if (!result || result === normalized) throw new Error();
        return result;
    } catch {
        throw new Error(`Unable to get the locale name for "${value}"`);
    }
};

export const localeNameSynchronously: TwingSynchronousCallable = (_ctx, value: string, locale?: string) => {
    try {
        const normalized = value.replace('_', '-');
        const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'language'});
        const result = displayNames.of(normalized);
        if (!result || result === normalized) throw new Error();
        return result;
    } catch {
        throw new Error(`Unable to get the locale name for "${value}"`);
    }
};

const getTimezoneDisplayName = (tz: string, locale: string): string => {
    const date = new Date(Date.UTC(2024, 0, 15));
    const parts = new Intl.DateTimeFormat(locale, {
        timeZone: tz,
        timeZoneName: 'long'
    }).formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    if (!tzPart) throw new Error();
    return tzPart.value;
};

export const timezoneName: TwingCallable = async (_ctx, value: string, locale?: string) => {
    try {
        return getTimezoneDisplayName(value, getLocale(locale));
    } catch {
        throw new Error(`Unable to get the timezone name for "${value}"`);
    }
};

export const timezoneNameSynchronously: TwingSynchronousCallable = (_ctx, value: string, locale?: string) => {
    try {
        return getTimezoneDisplayName(value, getLocale(locale));
    } catch {
        throw new Error(`Unable to get the timezone name for "${value}"`);
    }
};
