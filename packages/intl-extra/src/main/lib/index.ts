import type {TwingExtension, TwingSynchronousExtension} from "@toppynl/twing";

export const packageName = "@toppynl/twing-intl-extra";

export const createIntlExtension = (
    _dateFormatterPrototype?: Intl.DateTimeFormat,
    _numberFormatterPrototype?: Intl.NumberFormat
): TwingExtension => ({
    filters: [],
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
    filters: [],
    functions: [],
    nodeVisitors: [],
    operators: [],
    tagHandlers: [],
    tests: []
});
