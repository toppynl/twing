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

export const packageName = "@toppynl/twing-intl-extra";

const localeArg = {name: 'locale', defaultValue: null};

export const createIntlExtension = (
    _dateFormatterPrototype?: Intl.DateTimeFormat,
    _numberFormatterPrototype?: Intl.NumberFormat
): TwingExtension => ({
    filters: [
        createFilter('country_name', countryName, [localeArg]),
        createFilter('currency_name', currencyName, [localeArg]),
        createFilter('currency_symbol', currencySymbol, [localeArg]),
        createFilter('language_name', languageName, [localeArg]),
        createFilter('locale_name', localeName, [localeArg]),
        createFilter('timezone_name', timezoneName, [localeArg]),
    ],
    functions: [],
    nodeVisitors: [],
    operators: [],
    tagHandlers: [],
    tests: []
});

export const createSynchronousIntlExtension = (
    _dateFormatterPrototype?: Intl.DateTimeFormat,
    _numberFormatterPrototype?: Intl.NumberFormat
): TwingSynchronousExtension => ({
    filters: [
        createSynchronousFilter('country_name', countryNameSynchronously, [localeArg]),
        createSynchronousFilter('currency_name', currencyNameSynchronously, [localeArg]),
        createSynchronousFilter('currency_symbol', currencySymbolSynchronously, [localeArg]),
        createSynchronousFilter('language_name', languageNameSynchronously, [localeArg]),
        createSynchronousFilter('locale_name', localeNameSynchronously, [localeArg]),
        createSynchronousFilter('timezone_name', timezoneNameSynchronously, [localeArg]),
    ],
    functions: [],
    nodeVisitors: [],
    operators: [],
    tagHandlers: [],
    tests: []
});
