import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";

type NumberAttrs = Map<string, number | boolean> | Record<string, number | boolean>;

const UNSUPPORTED_STYLES = new Set(['spellout', 'duration']);

const mapAttrs = (attrs: NumberAttrs): Intl.NumberFormatOptions => {
    const options: Intl.NumberFormatOptions = {};
    const entries: Iterable<[string, number | boolean]> =
        attrs instanceof Map ? attrs.entries() : Object.entries(attrs) as [string, number | boolean][];
    for (const [key, value] of entries) {
        switch (key) {
            case 'fraction_digits':
                options.minimumFractionDigits = value as number;
                options.maximumFractionDigits = value as number;
                break;
            case 'min_fraction_digits':
                options.minimumFractionDigits = value as number;
                break;
            case 'max_fraction_digits':
                options.maximumFractionDigits = value as number;
                break;
            case 'min_integer_digits':
                options.minimumIntegerDigits = value as number;
                break;
            case 'grouping_used':
                options.useGrouping = value as boolean;
                break;
            case 'min_significant_digits':
                options.minimumSignificantDigits = value as number;
                break;
            case 'max_significant_digits':
                options.maximumSignificantDigits = value as number;
                break;
        }
    }
    return options;
};

const mapStyle = (style: string): Intl.NumberFormatOptions => {
    if (UNSUPPORTED_STYLES.has(style)) {
        throw new Error(`The "${style}" number style is not supported by the built-in Intl API`);
    }
    switch (style) {
        case 'decimal': return {style: 'decimal'};
        case 'currency': return {style: 'currency'};
        case 'percent': return {style: 'percent'};
        case 'scientific': return {notation: 'scientific'};
        case 'ordinal': return {style: 'decimal'};
        default: throw new Error(`Unknown number style "${style}"`);
    }
};

const resolveLocale = (locale: string | null | undefined, prototype?: Intl.NumberFormat): string =>
    locale || prototype?.resolvedOptions().locale || new Intl.NumberFormat().resolvedOptions().locale;

const resolveFormatNumber = (
    number: number,
    attrs: NumberAttrs,
    style: string,
    locale: string | null | undefined,
    prototype?: Intl.NumberFormat
): string => {
    const styleOptions = mapStyle(style);
    const attrOptions = mapAttrs(attrs);
    return new Intl.NumberFormat(resolveLocale(locale, prototype), {...styleOptions, ...attrOptions}).format(number);
};

const resolveFormatCurrency = (
    amount: number,
    currency: string,
    attrs: NumberAttrs,
    locale: string | null | undefined,
    prototype?: Intl.NumberFormat
): string => {
    const options: Intl.NumberFormatOptions = {style: 'currency', currency, ...mapAttrs(attrs)};
    return new Intl.NumberFormat(resolveLocale(locale, prototype), options).format(amount);
};

export const makeFormatCurrencyFilter = (prototype?: Intl.NumberFormat): TwingCallable =>
    async (_ctx, amount: number, currency: string, attrs: NumberAttrs = {}, locale?: string) =>
        resolveFormatCurrency(amount, currency, attrs, locale, prototype);

export const makeFormatCurrencyFilterSynchronously = (prototype?: Intl.NumberFormat): TwingSynchronousCallable =>
    (_ctx, amount: number, currency: string, attrs: NumberAttrs = {}, locale?: string) =>
        resolveFormatCurrency(amount, currency, attrs, locale, prototype);

export const makeFormatNumberFilter = (prototype?: Intl.NumberFormat): TwingCallable =>
    async (_ctx, number: number, attrs: NumberAttrs = {}, style = 'decimal', _type = 'default', locale?: string) =>
        resolveFormatNumber(number, attrs, style, locale, prototype);

export const makeFormatNumberFilterSynchronously = (prototype?: Intl.NumberFormat): TwingSynchronousCallable =>
    (_ctx, number: number, attrs: NumberAttrs = {}, style = 'decimal', _type = 'default', locale?: string) =>
        resolveFormatNumber(number, attrs, style, locale, prototype);

// Wildcard format_*_number: style is passed first via nativeArguments
export const makeFormatNumberStyleFilter = (prototype?: Intl.NumberFormat): TwingCallable =>
    async (_ctx, style: string, number: number, attrs: NumberAttrs = {}, _type = 'default', locale?: string) =>
        resolveFormatNumber(number, attrs, style, locale, prototype);

export const makeFormatNumberStyleFilterSynchronously = (prototype?: Intl.NumberFormat): TwingSynchronousCallable =>
    (_ctx, style: string, number: number, attrs: NumberAttrs = {}, _type = 'default', locale?: string) =>
        resolveFormatNumber(number, attrs, style, locale, prototype);
