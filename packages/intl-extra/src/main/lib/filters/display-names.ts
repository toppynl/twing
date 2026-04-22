import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";

const getLocale = (locale: string | null | undefined): string => {
    if (locale) return locale.replaceAll('_', '-');
    return new Intl.DateTimeFormat().resolvedOptions().locale;
};

const resolveCountryName = (value: string, locale?: string): string => {
    const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'region', fallback: 'none'});
    const result = displayNames.of(value);
    if (!result) throw new Error(`Unable to get the country name for "${value}"`);
    return result;
};

export const countryName: TwingCallable = async (_ctx, value: string, locale?: string) => {
    try {
        return resolveCountryName(value, locale);
    } catch {
        throw new Error(`Unable to get the country name for "${value}"`);
    }
};

export const countryNameSynchronously: TwingSynchronousCallable = (_ctx, value: string, locale?: string) => {
    try {
        return resolveCountryName(value, locale);
    } catch {
        throw new Error(`Unable to get the country name for "${value}"`);
    }
};

const resolveCurrencyName = (value: string, locale?: string): string => {
    const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'currency', fallback: 'none'});
    const result = displayNames.of(value);
    if (!result) throw new Error(`Unable to get the currency name for "${value}"`);
    return result;
};

export const currencyName: TwingCallable = async (_ctx, value: string, locale?: string) => {
    try {
        return resolveCurrencyName(value, locale);
    } catch {
        throw new Error(`Unable to get the currency name for "${value}"`);
    }
};

export const currencyNameSynchronously: TwingSynchronousCallable = (_ctx, value: string, locale?: string) => {
    try {
        return resolveCurrencyName(value, locale);
    } catch {
        throw new Error(`Unable to get the currency name for "${value}"`);
    }
};

const resolveCurrencySymbol = (value: string, locale?: string): string => {
    const parts = new Intl.NumberFormat([getLocale(locale)], {
        style: 'currency',
        currency: value,
        currencyDisplay: 'symbol'
    }).formatToParts(0);
    const symbol = parts.find(p => p.type === 'currency');
    if (!symbol) throw new Error(`Unable to get the currency symbol for "${value}"`);
    return symbol.value;
};

export const currencySymbol: TwingCallable = async (_ctx, value: string, locale?: string) => {
    try {
        return resolveCurrencySymbol(value, locale);
    } catch {
        throw new Error(`Unable to get the currency symbol for "${value}"`);
    }
};

export const currencySymbolSynchronously: TwingSynchronousCallable = (_ctx, value: string, locale?: string) => {
    try {
        return resolveCurrencySymbol(value, locale);
    } catch {
        throw new Error(`Unable to get the currency symbol for "${value}"`);
    }
};

const resolveLanguageName = (value: string, locale?: string): string => {
    const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'language', fallback: 'none'});
    const result = displayNames.of(value);
    if (!result) throw new Error(`Unable to get the language name for "${value}"`);
    return result;
};

export const languageName: TwingCallable = async (_ctx, value: string, locale?: string) => {
    try {
        return resolveLanguageName(value, locale);
    } catch {
        throw new Error(`Unable to get the language name for "${value}"`);
    }
};

export const languageNameSynchronously: TwingSynchronousCallable = (_ctx, value: string, locale?: string) => {
    try {
        return resolveLanguageName(value, locale);
    } catch {
        throw new Error(`Unable to get the language name for "${value}"`);
    }
};

const resolveLocaleName = (value: string, locale?: string): string => {
    const normalized = value.replaceAll('_', '-');
    const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'language', fallback: 'none'});
    const result = displayNames.of(normalized);
    if (!result) throw new Error(`Unable to get the locale name for "${value}"`);
    return result;
};

export const localeName: TwingCallable = async (_ctx, value: string, locale?: string) => {
    try {
        return resolveLocaleName(value, locale);
    } catch {
        throw new Error(`Unable to get the locale name for "${value}"`);
    }
};

export const localeNameSynchronously: TwingSynchronousCallable = (_ctx, value: string, locale?: string) => {
    try {
        return resolveLocaleName(value, locale);
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
