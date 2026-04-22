# Design: @toppynl/twing-intl-extra

Port of [twigphp/intl-extra](https://github.com/twigphp/intl-extra) to TypeScript/Twing.

## Package

- Location: `packages/intl-extra/`
- Published as: `@toppynl/twing-intl-extra`
- Min Node.js: 20 (root `package.json` engines bumped from `>=18` to `>=20`)
- Peer deps: `@toppynl/twing`
- Runtime deps: `countries-and-timezones`
- Bundled static data: ISO 639-1 language codes (~180 entries), ISO 15924 script codes (~200 entries)

## Factory API

```ts
createIntlExtension(
    dateFormatterPrototype?: Intl.DateTimeFormat,
    numberFormatterPrototype?: Intl.NumberFormat
): TwingExtension

createSynchronousIntlExtension(
    dateFormatterPrototype?: Intl.DateTimeFormat,
    numberFormatterPrototype?: Intl.NumberFormat
): TwingSynchronousExtension
```

When prototypes are provided their locale and format settings serve as defaults, mirroring PHP's constructor signature (`IntlDateFormatter`, `NumberFormatter` prototypes).

## Structure

Mirrors `html-extra`: dual `lib`/`light` builds (identical — all Intl APIs are browser-safe), same rollup + tsconfig setup.

```
packages/intl-extra/
  src/main/
    lib.ts
    light.ts
    lib/
      index.ts          ← createIntlExtension / createSynchronousIntlExtension
      filters/
        country-name.ts
        currency-name.ts
        currency-symbol.ts
        language-name.ts
        locale-name.ts
        timezone-name.ts
        country-timezones.ts
        format-currency.ts
        format-number.ts
        format-number-style.ts   ← backing fn for format_*_number wildcard
        format-datetime.ts
        format-date.ts
        format-time.ts
      functions/
        country-timezones.ts
        country-names.ts
        currency-names.ts
        timezone-names.ts
        language-names.ts
        script-names.ts
        locale-names.ts
      data/
        iso-639-1.json    ← language codes
        iso-15924.json    ← script codes
    light/              ← symlinked or identical to lib/
  src/test/
    tests/integration/
      filters/
        country-name.ts
        … (one file per filter)
      functions/
        country-timezones.ts
        … (one file per function)
```

## Filters

| Filter | Signature | Backend |
|--------|-----------|---------|
| `country_name` | `(code, locale?)` | `Intl.DisplayNames({type:'region'})` |
| `currency_name` | `(code, locale?)` | `Intl.DisplayNames({type:'currency'})` |
| `currency_symbol` | `(code, locale?)` | `Intl.NumberFormat.formatToParts` |
| `language_name` | `(code, locale?)` | `Intl.DisplayNames({type:'language'})` |
| `locale_name` | `(code, locale?)` | `Intl.DisplayNames({type:'language'})` |
| `timezone_name` | `(tz, locale?)` | `Intl.DateTimeFormat` + `timeZoneName:'long'` |
| `country_timezones` | `(code)` | `countries-and-timezones` |
| `format_currency` | `(amount, currency, attrs?, locale?)` | `Intl.NumberFormat({style:'currency'})` |
| `format_number` | `(number, attrs?, style?, type?, locale?)` | `Intl.NumberFormat` |
| `format_*_number` | wildcard — matched style via `nativeArguments` | `Intl.NumberFormat` |
| `format_datetime` | `(date, dateFormat?, timeFormat?, pattern?, timezone?, calendar?, locale?)` | `Intl.DateTimeFormat` |
| `format_date` | `(date, dateFormat?, pattern?, timezone?, calendar?, locale?)` | `Intl.DateTimeFormat` (date only) |
| `format_time` | `(date, timeFormat?, pattern?, timezone?, calendar?, locale?)` | `Intl.DateTimeFormat` (time only) |

### `format_*_number` wildcard

Uses Twing's existing wildcard filter infrastructure (`get-filter.ts` + `nativeArguments`). No core changes required. Style names map to `Intl.NumberFormat` options:

| Style | `Intl.NumberFormat` mapping |
|-------|-----------------------------|
| `decimal` | `{style:'decimal'}` |
| `currency` | `{style:'currency'}` |
| `percent` | `{style:'percent'}` |
| `scientific` | `{notation:'scientific'}` |
| `ordinal` | `{style:'decimal'}` (approximation) |
| `spellout` | throws `TwingRuntimeError` — not supported by built-in Intl |
| `duration` | throws `TwingRuntimeError` — not supported by built-in Intl |

### Date input

`format_datetime`, `format_date`, `format_time` accept `DateTime | string | null` (Luxon `DateTime`, ISO string, or `null` for current time), consistent with Twing's existing `date` filter.

`timezone` parameter semantics (matching PHP): `null` = use formatter prototype's timezone, `false` = leave unchanged, `string` = timezone identifier.

Date/time format strings: `'none' | 'short' | 'medium' | 'long' | 'full'` mapped to `Intl.DateTimeFormat` `dateStyle`/`timeStyle`.

## Functions

| Function | Returns | Backend |
|----------|---------|---------|
| `country_timezones(code)` | `string[]` | `countries-and-timezones` |
| `country_names(locale?)` | `Map<code, name>` | 248 codes from `countries-and-timezones` + `Intl.DisplayNames` |
| `currency_names(locale?)` | `Map<code, name>` | `Intl.supportedValuesOf('currency')` + `Intl.DisplayNames` |
| `timezone_names(locale?)` | `Map<id, name>` | `Intl.supportedValuesOf('timeZone')` + display name lookup |
| `language_names(locale?)` | `Map<code, name>` | bundled ISO 639-1 + `Intl.DisplayNames({type:'language'})` |
| `script_names(locale?)` | `Map<code, name>` | bundled ISO 15924 + `Intl.DisplayNames({type:'script'})` |
| `locale_names(locale?)` | `Map<code, name>` | bundled ISO 639-1 + `Intl.DisplayNames({type:'language'})` |

## Error handling

Mirrors PHP — invalid inputs throw `TwingRuntimeError`:
- Unknown country/currency/language/timezone code → descriptive message
- Unsupported number style (`spellout`, `duration`) → `'spellout' style is not supported by the built-in Intl API.`
- Invalid date/time format string → `'foo' is not a valid date format, known formats are: 'none', 'short', 'medium', 'long', 'full'.`

## Testing

One integration test file per filter and per function under `packages/intl-extra/src/test/tests/integration/`. Each uses a `TestBase` subclass and runs both async and synchronous environments. Locale is fixed to `en` in all tests to avoid machine-locale flakiness.
