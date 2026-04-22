import {createFilter, createSynchronousFilter} from "@toppynl/twing";
import type {TwingExtension, TwingSynchronousExtension} from "@toppynl/twing";
import {
    countryName, countryNameSynchronously,
    currencyName, currencyNameSynchronously,
    currencySymbol, currencySymbolSynchronously,
    languageName, languageNameSynchronously,
    localeName, localeNameSynchronously,
    timezoneName, timezoneNameSynchronously
} from "./filters/display-names";
import {countryTimezones, countryTimezonesSynchronously} from "./filters/country-timezones";
import {
    makeFormatCurrencyFilter, makeFormatCurrencyFilterSynchronously,
    makeFormatNumberFilter, makeFormatNumberFilterSynchronously,
    makeFormatNumberStyleFilter, makeFormatNumberStyleFilterSynchronously
} from "./filters/format-number";

export const packageName = "@toppynl/twing-intl-extra";

const localeArg = {name: 'locale', defaultValue: null};

export const createIntlExtension = (
    _dateFormatterPrototype?: Intl.DateTimeFormat,
    numberFormatterPrototype?: Intl.NumberFormat
): TwingExtension => ({
    filters: [
        createFilter('country_name', countryName, [localeArg]),
        createFilter('currency_name', currencyName, [localeArg]),
        createFilter('currency_symbol', currencySymbol, [localeArg]),
        createFilter('language_name', languageName, [localeArg]),
        createFilter('locale_name', localeName, [localeArg]),
        createFilter('timezone_name', timezoneName, [localeArg]),
        createFilter('country_timezones', countryTimezones, []),
        createFilter('format_currency', makeFormatCurrencyFilter(numberFormatterPrototype), [
            {name: 'currency'},
            {name: 'attrs', defaultValue: {}},
            {name: 'locale', defaultValue: null}
        ]),
        createFilter('format_number', makeFormatNumberFilter(numberFormatterPrototype), [
            {name: 'attrs', defaultValue: {}},
            {name: 'style', defaultValue: 'decimal'},
            {name: 'type', defaultValue: 'default'},
            {name: 'locale', defaultValue: null}
        ]),
        createFilter('format_*_number', makeFormatNumberStyleFilter(numberFormatterPrototype), [
            {name: 'attrs', defaultValue: {}},
            {name: 'type', defaultValue: 'default'},
            {name: 'locale', defaultValue: null}
        ]),
    ],
    functions: [],
    nodeVisitors: [],
    operators: [],
    tagHandlers: [],
    tests: []
});

export const createSynchronousIntlExtension = (
    _dateFormatterPrototype?: Intl.DateTimeFormat,
    numberFormatterPrototype?: Intl.NumberFormat
): TwingSynchronousExtension => ({
    filters: [
        createSynchronousFilter('country_name', countryNameSynchronously, [localeArg]),
        createSynchronousFilter('currency_name', currencyNameSynchronously, [localeArg]),
        createSynchronousFilter('currency_symbol', currencySymbolSynchronously, [localeArg]),
        createSynchronousFilter('language_name', languageNameSynchronously, [localeArg]),
        createSynchronousFilter('locale_name', localeNameSynchronously, [localeArg]),
        createSynchronousFilter('timezone_name', timezoneNameSynchronously, [localeArg]),
        createSynchronousFilter('country_timezones', countryTimezonesSynchronously, []),
        createSynchronousFilter('format_currency', makeFormatCurrencyFilterSynchronously(numberFormatterPrototype), [
            {name: 'currency'},
            {name: 'attrs', defaultValue: {}},
            {name: 'locale', defaultValue: null}
        ]),
        createSynchronousFilter('format_number', makeFormatNumberFilterSynchronously(numberFormatterPrototype), [
            {name: 'attrs', defaultValue: {}},
            {name: 'style', defaultValue: 'decimal'},
            {name: 'type', defaultValue: 'default'},
            {name: 'locale', defaultValue: null}
        ]),
        createSynchronousFilter('format_*_number', makeFormatNumberStyleFilterSynchronously(numberFormatterPrototype), [
            {name: 'attrs', defaultValue: {}},
            {name: 'type', defaultValue: 'default'},
            {name: 'locale', defaultValue: null}
        ]),
    ],
    functions: [],
    nodeVisitors: [],
    operators: [],
    tagHandlers: [],
    tests: []
});
