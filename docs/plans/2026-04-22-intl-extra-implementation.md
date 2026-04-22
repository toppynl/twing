# @toppynl/twing-intl-extra Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create `packages/intl-extra/` publishing `@toppynl/twing-intl-extra` — a port of [twigphp/intl-extra](https://github.com/twigphp/intl-extra) that adds 12 filters and 7 functions for i18n formatting to Twing.

**Architecture:** New pnpm workspace package mirroring `packages/html-extra/` structure. All formatting uses Node 20's built-in `Intl` API (`Intl.DisplayNames`, `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.supportedValuesOf`). `countries-and-timezones` provides country→timezone mapping and country code enumeration. Two small bundled JSON files supply ISO 639-1 language codes and ISO 15924 script codes (not available from built-in Intl). Wildcard filter `format_*_number` uses Twing's existing wildcard infrastructure — no core changes needed.

**Tech Stack:** TypeScript, Twing `createFilter`/`createFunction`/`createSynchronousFilter`/`createSynchronousFunction`, Rollup, Tape, `countries-and-timezones`, built-in `Intl` API (Node ≥ 20).

**Reference files to keep open:**
- `packages/html-extra/src/main/rollup.config.mjs` — copy/adapt for intl-extra
- `packages/html-extra/src/main/lib/index.ts` — extension wiring pattern
- `packages/html-extra/src/test/tests/harness.ts` — test harness pattern
- `packages/html-extra/src/test/tests/functions/html-classes.ts` — test case pattern

---

## Task 1: Scaffold the package

**Files:**
- Create: `packages/intl-extra/package.json`
- Create: `packages/intl-extra/src/tsconfig.json`
- Create: `packages/intl-extra/src/main/tsconfig.json`
- Create: `packages/intl-extra/src/test/tsconfig.json`
- Create: `packages/intl-extra/src/main/rollup.config.mjs`
- Create: `packages/intl-extra/src/test/rollup.config.mjs`

**Step 1: Create `packages/intl-extra/package.json`**

```json
{
  "name": "@toppynl/twing-intl-extra",
  "version": "0.1.0",
  "private": true,
  "main": "src/main/target/index.cjs",
  "types": "src/main/target/lib.d.ts",
  "exports": {
    ".": {
      "import": "./src/main/target/index.cjs",
      "require": "./src/main/target/index.cjs",
      "types": "./src/main/target/lib.d.ts"
    },
    "./light": {
      "import": "./src/main/target/light/index.cjs",
      "require": "./src/main/target/light/index.cjs",
      "types": "./src/main/target/light/light.d.ts"
    }
  },
  "scripts": {
    "prebuild:test": "pnpm run build:main",
    "build:main": "(cd src/main && rollup -c) && cp LICENSE src/main/target/LICENSE",
    "build:test": "(cd src/test && rollup -c)",
    "test": "node src/test/target/index.cjs"
  },
  "dependencies": {
    "countries-and-timezones": "^3.0.0"
  },
  "devDependencies": {
    "@nightlycommit/rollup-plugin-package-manifest": "^1.0.0-alpha.2",
    "@types/node": "^20.0.0",
    "@types/tape": "^5.8.1",
    "@vitrail/rollup-plugin-typescript": "^1.0.4-beta.0",
    "rollup": "^4.0.0",
    "tape": "^5.6.1",
    "@toppynl/twing": "workspace:*"
  }
}
```

**Step 2: Create `packages/intl-extra/src/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "es2017",
    "module": "Preserve",
    "moduleResolution": "bundler",
    "removeComments": false,
    "strict": true,
    "resolveJsonModule": true
  }
}
```

Note: `resolveJsonModule: true` is needed to import the bundled ISO data JSON files.

**Step 3: Create `packages/intl-extra/src/main/tsconfig.json`**

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "noUnusedParameters": true,
    "noUnusedLocals": true
  }
}
```

**Step 4: Create `packages/intl-extra/src/test/tsconfig.json`**

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "inlineSourceMap": true,
    "inlineSources": true
  }
}
```

**Step 5: Create `packages/intl-extra/src/main/rollup.config.mjs`**

```js
import {createTypeScriptPlugin} from "@vitrail/rollup-plugin-typescript";
import {createPackageManifestPlugin} from "@nightlycommit/rollup-plugin-package-manifest";
import {rmSync} from "node:fs";
import {dirname, join} from "node:path";

const commonjsTargetName = 'index.cjs';

const external = (moduleId) => {
    return !moduleId.startsWith('.') && !moduleId.startsWith('/');
};

const plugins = [
    {
        generateBundle: (options) => {
            const destination = dirname(options.file);
            rmSync(destination, {force: true, recursive: true});
        }
    }
];

const program = () => {
    const version = process.env.VERSION || '0.0.0-SNAPSHOT';

    console.log(`Building @toppynl/twing-intl-extra under version ${version}...`);

    return [{
        input: ['lib.ts'],
        external,
        plugins: [
            ...plugins,
            createTypeScriptPlugin({compilerOptions: {declaration: true}})
        ],
        output: [{
            format: "commonjs",
            file: join('target', commonjsTargetName),
            plugins: [
                createPackageManifestPlugin({
                    name: '@toppynl/twing-intl-extra',
                    version,
                    description: "Intl helpers for Twing (port of twig/intl-extra)",
                    keywords: ["twing", "twig", "intl-extra", "i18n", "intl", "format"],
                    license: "MIT",
                    main: "index.cjs",
                    types: "lib.d.ts",
                    exports: {
                        ".": {
                            import: "./index.cjs",
                            require: "./index.cjs",
                            types: "./lib.d.ts"
                        },
                        "./light": {
                            import: "./light/index.cjs",
                            require: "./light/index.cjs",
                            types: "./light/light.d.ts"
                        }
                    },
                    dependencies: {
                        "countries-and-timezones": "^3.0.0"
                    },
                    peerDependencies: {
                        "@toppynl/twing": "*"
                    },
                    node: ">=20.0.0"
                })
            ]
        }]
    }, {
        input: ['light.ts'],
        external,
        plugins: [
            ...plugins,
            createTypeScriptPlugin({compilerOptions: {declaration: true}})
        ],
        output: [{
            format: "commonjs",
            file: join('target/light', commonjsTargetName)
        }]
    }];
};

export default program;
```

**Step 6: Create `packages/intl-extra/src/test/rollup.config.mjs`**

Copy exactly from `packages/html-extra/src/test/rollup.config.mjs` — it is generic and needs no changes.

**Step 7: Install dependencies**

```bash
cd /var/www/forks/twing && pnpm install
```

Expected: `countries-and-timezones` installed, workspace linked.

**Step 8: Commit**

```bash
git add packages/intl-extra/
git commit -m "chore(intl-extra): scaffold package"
```

---

## Task 2: Add static data files

**Files:**
- Create: `packages/intl-extra/src/main/lib/data/iso-639-1.json`
- Create: `packages/intl-extra/src/main/lib/data/iso-15924.json`

These are arrays of codes. `Intl.DisplayNames` translates each code to a localized name — we only need the list of codes to iterate over.

**Step 1: Create `packages/intl-extra/src/main/lib/data/iso-639-1.json`**

ISO 639-1 two-letter language codes (180 codes):

```json
["ab","aa","af","ak","sq","am","ar","an","hy","as","av","ae","ay","az","bm","ba","eu","be","bn","bi","bs","br","bg","my","ca","ch","ce","zh","cu","cv","kw","co","cr","hr","cs","da","dv","nl","dz","en","eo","et","ee","fo","fj","fi","fr","fy","ff","gd","gl","lg","ka","de","el","kl","gn","gu","ht","ha","he","hz","hi","ho","hu","is","io","ig","id","ia","ie","iu","ik","ga","it","ja","jv","kn","kr","ks","kk","km","ki","rw","ky","kv","kg","ko","kj","ku","lo","la","lv","li","ln","lt","lu","lb","mk","mg","ms","ml","mt","gv","mi","mr","mh","mo","mn","na","nv","nd","nr","ng","ne","no","nb","nn","oc","oj","or","om","os","pi","ps","fa","pl","pt","pa","qu","ro","rm","rn","ru","se","sm","sg","sa","sc","sr","sn","sd","si","sk","sl","so","st","es","su","sw","ss","sv","tl","ty","tg","ta","tt","te","th","bo","ti","to","ts","tn","tr","tk","tw","ug","uk","ur","uz","ve","vi","vo","wa","cy","wo","xh","yi","yo","za","zu"]
```

**Step 2: Create `packages/intl-extra/src/main/lib/data/iso-15924.json`**

ISO 15924 four-letter script codes (common subset, ~60 codes — `Intl.DisplayNames` only knows widely-used scripts):

```json
["Adlm","Arab","Armn","Avst","Bali","Bamu","Batk","Beng","Bopo","Brah","Buhd","Cans","Cari","Cham","Cher","Copt","Cprt","Cyrl","Deva","Dsrt","Egyp","Ethi","Geor","Glag","Goth","Grek","Gujr","Guru","Hang","Hani","Hano","Hebr","Hira","Hrkt","Hung","Ital","Java","Kali","Kana","Khar","Khmr","Knda","Kthi","Lana","Laoo","Latn","Lepc","Limb","Linb","Lisu","Lyci","Lydi","Mand","Mlym","Mong","Mtei","Mymr","Nkoo","Ogam","Olck","Orkh","Orya","Osma","Phag","Phli","Phlp","Phnx","Plrd","Rjng","Roro","Runr","Samr","Sarb","Saur","Shaw","Sinh","Sund","Sylo","Syrc","Tagb","Taml","Tang","Tavt","Telu","Tfng","Tglg","Thaa","Thai","Tibt","Ugar","Vaii","Xpeo","Xsux","Yiii","Zinh","Zmth","Zsym","Zxxx","Zyyy","Zzzz"]
```

**Step 3: Commit**

```bash
git add packages/intl-extra/src/main/lib/data/
git commit -m "feat(intl-extra): add ISO 639-1 and ISO 15924 static data"
```

---

## Task 3: Test harness and scaffold

**Files:**
- Create: `packages/intl-extra/src/test/index.ts`
- Create: `packages/intl-extra/src/test/tests/index.ts`
- Create: `packages/intl-extra/src/test/tests/harness.ts`
- Create: `packages/intl-extra/src/main/lib.ts`
- Create: `packages/intl-extra/src/main/light.ts`
- Create: `packages/intl-extra/src/main/lib/index.ts` (stub)
- Create: `packages/intl-extra/src/main/light/index.ts`

**Step 1: Create `packages/intl-extra/src/main/lib.ts`**

```ts
export * from "./lib/index";
```

**Step 2: Create `packages/intl-extra/src/main/light.ts`**

```ts
export * from "./light/index";
```

**Step 3: Create `packages/intl-extra/src/main/light/index.ts`**

```ts
export * from "../lib/index";
```

**Step 4: Create a stub `packages/intl-extra/src/main/lib/index.ts`**

```ts
import {createFilter, createSynchronousFilter, createFunction, createSynchronousFunction} from "@toppynl/twing";
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
```

**Step 5: Create `packages/intl-extra/src/test/tests/harness.ts`**

```ts
import tape, {Test} from "tape";
import {
    createArrayLoader,
    createEnvironment,
    createSynchronousArrayLoader,
    createSynchronousEnvironment
} from "@toppynl/twing";
import {createIntlExtension, createSynchronousIntlExtension} from "../../main/lib";

export type HarnessCase = {
    description: string;
    template: string;
    expectation?: string;
    trimmedExpectation?: string;
    context?: Record<string, unknown>;
    expectedErrorMessage?: string;
    dateFormatterPrototype?: Intl.DateTimeFormat;
    numberFormatterPrototype?: Intl.NumberFormat;
};

export const runCase = ({
    description,
    template,
    expectation,
    trimmedExpectation,
    context,
    expectedErrorMessage,
    dateFormatterPrototype,
    numberFormatterPrototype
}: HarnessCase) => {
    tape(description, ({test}) => {
        test('asynchronously', async ({fail, equal, end}: Test) => {
            const loader = createArrayLoader({'index.twig': template});
            const environment = createEnvironment(loader);
            environment.addExtension(createIntlExtension(dateFormatterPrototype, numberFormatterPrototype));

            try {
                const actual = await environment.render('index.twig', context || {});

                if (expectedErrorMessage) {
                    fail(`${description}: should throw`);
                } else if (expectation !== undefined) {
                    equal(actual, expectation, `${description}: renders as expected`);
                } else if (trimmedExpectation !== undefined) {
                    equal(actual.trim(), trimmedExpectation.trim(), `${description}: trimmed`);
                }
            } catch (error: any) {
                if (expectedErrorMessage) {
                    equal(`${error.name}: ${error.message}`, expectedErrorMessage, `${description}: throws`);
                } else {
                    fail(`${description}: threw unexpected error: ${error.message}`);
                }
            }

            end();
        });

        test('synchronously', ({fail, equal, end}: Test) => {
            const loader = createSynchronousArrayLoader({'index.twig': template});
            const environment = createSynchronousEnvironment(loader);
            environment.addExtension(createSynchronousIntlExtension(dateFormatterPrototype, numberFormatterPrototype));

            try {
                const actual = environment.render('index.twig', context || {});

                if (expectedErrorMessage) {
                    fail(`${description}: should throw`);
                } else if (expectation !== undefined) {
                    equal(actual, expectation, `${description}: renders as expected`);
                } else if (trimmedExpectation !== undefined) {
                    equal(actual.trim(), trimmedExpectation.trim(), `${description}: trimmed`);
                }
            } catch (error: any) {
                if (expectedErrorMessage) {
                    equal(`${error.name}: ${error.message}`, expectedErrorMessage, `${description}: throws`);
                } else {
                    fail(`${description}: threw unexpected error: ${error.message}`);
                }
            }

            end();
        });
    });
};
```

**Step 6: Create `packages/intl-extra/src/test/tests/index.ts`**

```ts
// filters and functions will be imported here as they are added
```

**Step 7: Create `packages/intl-extra/src/test/index.ts`**

```ts
import "./tests";
```

**Step 8: Build and verify scaffold compiles**

```bash
cd /var/www/forks/twing/packages/intl-extra && pnpm run build:main
```

Expected: `src/main/target/` created, no TypeScript errors.

```bash
pnpm run build:test && pnpm run test
```

Expected: test suite runs with 0 test cases, exits cleanly.

**Step 9: Commit**

```bash
git add packages/intl-extra/src/
git commit -m "feat(intl-extra): add test harness and stub extension"
```

---

## Task 4: Display name filters

Implement `country_name`, `currency_name`, `currency_symbol`, `language_name`, `locale_name`, `timezone_name`.

**Files:**
- Create: `packages/intl-extra/src/main/lib/filters/display-names.ts`
- Create: `packages/intl-extra/src/test/tests/filters/display-names.ts`
- Modify: `packages/intl-extra/src/main/lib/index.ts`
- Modify: `packages/intl-extra/src/test/tests/index.ts`

**Step 1: Write the failing tests**

Create `packages/intl-extra/src/test/tests/filters/display-names.ts`:

```ts
import {runCase} from "../../harness";

runCase({
    description: 'country_name filter: US in English',
    template: `{{ 'US'|country_name }}`,
    expectation: 'United States'
});

runCase({
    description: 'country_name filter: locale override',
    template: `{{ 'US'|country_name('fr') }}`,
    expectation: 'États-Unis'
});

runCase({
    description: 'country_name filter: invalid code throws',
    template: `{{ 'XX'|country_name }}`,
    expectedErrorMessage: 'TwingRuntimeError: Unable to get the country name for "XX" in "index.twig" at line 1, column 4'
});

runCase({
    description: 'currency_name filter: EUR in English',
    template: `{{ 'EUR'|currency_name }}`,
    expectation: 'Euro'
});

runCase({
    description: 'currency_symbol filter: EUR',
    template: `{{ 'EUR'|currency_symbol }}`,
    expectation: '€'
});

runCase({
    description: 'currency_symbol filter: USD in English',
    template: `{{ 'USD'|currency_symbol }}`,
    expectation: '$'
});

runCase({
    description: 'language_name filter: French in English',
    template: `{{ 'fr'|language_name }}`,
    expectation: 'French'
});

runCase({
    description: 'locale_name filter: fr_FR in English',
    template: `{{ 'fr_FR'|locale_name }}`,
    expectation: 'French (France)'
});

runCase({
    description: 'timezone_name filter: America/New_York',
    template: `{{ 'America/New_York'|timezone_name('en') }}`,
    expectation: 'Eastern Standard Time'
});

runCase({
    description: 'timezone_name filter: invalid timezone throws',
    template: `{{ 'Invalid/Zone'|timezone_name }}`,
    expectedErrorMessage: 'TwingRuntimeError: Unable to get the timezone name for "Invalid/Zone" in "index.twig" at line 1, column 4'
});
```

**Step 2: Register tests and build to verify failure**

In `packages/intl-extra/src/test/tests/index.ts`:

```ts
import "./filters/display-names";
```

```bash
cd /var/www/forks/twing/packages/intl-extra && pnpm run build:test && pnpm run test
```

Expected: all display-names tests FAIL (filters not yet registered).

**Step 3: Implement the filters**

Create `packages/intl-extra/src/main/lib/filters/display-names.ts`:

```ts
import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";

const getLocale = (locale: string | null | undefined, prototype?: Intl.DateTimeFormat | Intl.NumberFormat): string => {
    if (locale) return locale.replace('_', '-');
    if (prototype) return prototype.resolvedOptions().locale;
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
```

**Step 4: Register filters in `packages/intl-extra/src/main/lib/index.ts`**

Replace the stub with:

```ts
import {createFilter, createSynchronousFilter, createFunction, createSynchronousFunction} from "@toppynl/twing";
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
```

**Step 5: Build and run tests**

```bash
cd /var/www/forks/twing/packages/intl-extra && pnpm run build:main && pnpm run build:test && pnpm run test
```

Expected: all display-names tests PASS.

> Note: The `timezone_name` test for `America/New_York` expects `'Eastern Standard Time'` — this is the winter-time name. The test uses a fixed January date internally. Verify the exact string matches Node 20's output; adjust the expected string if needed.

**Step 6: Commit**

```bash
git add packages/intl-extra/src/
git commit -m "feat(intl-extra): add display name filters (country_name, currency_name, currency_symbol, language_name, locale_name, timezone_name)"
```

---

## Task 5: country_timezones filter

**Files:**
- Create: `packages/intl-extra/src/main/lib/filters/country-timezones.ts`
- Create: `packages/intl-extra/src/test/tests/filters/country-timezones.ts`
- Modify: `packages/intl-extra/src/main/lib/index.ts`
- Modify: `packages/intl-extra/src/test/tests/index.ts`

**Step 1: Write failing tests**

Create `packages/intl-extra/src/test/tests/filters/country-timezones.ts`:

```ts
import {runCase} from "../../harness";

runCase({
    description: 'country_timezones filter: NL has Amsterdam timezone',
    template: `{{ 'NL'|country_timezones|join(', ') }}`,
    expectation: 'Europe/Amsterdam'
});

runCase({
    description: 'country_timezones filter: US has multiple timezones',
    template: `{{ 'US'|country_timezones|length > 1 ? 'yes' : 'no' }}`,
    expectation: 'yes'
});

runCase({
    description: 'country_timezones filter: invalid code throws',
    template: `{{ 'XX'|country_timezones }}`,
    expectedErrorMessage: 'TwingRuntimeError: No timezones found for country "XX" in "index.twig" at line 1, column 4'
});
```

Add to `packages/intl-extra/src/test/tests/index.ts`:

```ts
import "./filters/display-names";
import "./filters/country-timezones";
```

```bash
cd /var/www/forks/twing/packages/intl-extra && pnpm run build:test && pnpm run test 2>&1 | tail -20
```

Expected: country-timezones tests FAIL.

**Step 2: Implement**

Create `packages/intl-extra/src/main/lib/filters/country-timezones.ts`:

```ts
import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";
import ct from "countries-and-timezones";

const getTimezones = (countryCode: string): string[] => {
    const timezones = ct.getTimezonesForCountry(countryCode);
    if (!timezones || timezones.length === 0) {
        throw new Error(`No timezones found for country "${countryCode}"`);
    }
    return timezones.map(tz => tz.name);
};

export const countryTimezones: TwingCallable = async (_ctx, value: string) => getTimezones(value);

export const countryTimezonesSynchronously: TwingSynchronousCallable = (_ctx, value: string) => getTimezones(value);
```

Add to `packages/intl-extra/src/main/lib/index.ts` imports and filter registrations:

```ts
import {countryTimezones, countryTimezonesSynchronously} from "./filters/country-timezones";
// ...
// In createIntlExtension filters array:
createFilter('country_timezones', countryTimezones, []),
// In createSynchronousIntlExtension filters array:
createSynchronousFilter('country_timezones', countryTimezonesSynchronously, []),
```

**Step 3: Build and test**

```bash
cd /var/www/forks/twing/packages/intl-extra && pnpm run build:main && pnpm run build:test && pnpm run test
```

Expected: all tests PASS.

**Step 4: Commit**

```bash
git add packages/intl-extra/src/
git commit -m "feat(intl-extra): add country_timezones filter"
```

---

## Task 6: Number format filters

Implements `format_currency`, `format_number`, and wildcard `format_*_number`.

**Files:**
- Create: `packages/intl-extra/src/main/lib/filters/format-number.ts`
- Create: `packages/intl-extra/src/test/tests/filters/format-number.ts`
- Modify: `packages/intl-extra/src/main/lib/index.ts`
- Modify: `packages/intl-extra/src/test/tests/index.ts`

**Step 1: Write failing tests**

Create `packages/intl-extra/src/test/tests/filters/format-number.ts`:

```ts
import {runCase} from "../../harness";

runCase({
    description: 'format_currency filter: basic USD',
    template: `{{ 1234.56|format_currency('USD', {}, 'en') }}`,
    expectation: '$1,234.56'
});

runCase({
    description: 'format_currency filter: EUR in German',
    template: `{{ 1234.56|format_currency('EUR', {}, 'de') }}`,
    expectation: '1.234,56 €'
});

runCase({
    description: 'format_number filter: decimal',
    template: `{{ 12345.678|format_number({}, 'decimal', 'default', 'en') }}`,
    expectation: '12,345.678'
});

runCase({
    description: 'format_number filter: fraction_digits attr',
    template: `{{ 12.3456|format_number({'fraction_digits': 2}, 'decimal', 'default', 'en') }}`,
    expectation: '12.35'
});

runCase({
    description: 'format_number filter: percent style',
    template: `{{ 0.75|format_number({}, 'percent', 'default', 'en') }}`,
    expectation: '75%'
});

runCase({
    description: 'format_decimal_number wildcard filter',
    template: `{{ 12345.6|format_decimal_number({}, 'default', 'en') }}`,
    expectation: '12,345.6'
});

runCase({
    description: 'format_percent_number wildcard filter',
    template: `{{ 0.5|format_percent_number({}, 'default', 'en') }}`,
    expectation: '50%'
});

runCase({
    description: 'format_spellout_number throws',
    template: `{{ 42|format_spellout_number }}`,
    expectedErrorMessage: 'TwingRuntimeError: The "spellout" number style is not supported by the built-in Intl API in "index.twig" at line 1, column 4'
});
```

Add to `packages/intl-extra/src/test/tests/index.ts`:

```ts
import "./filters/display-names";
import "./filters/country-timezones";
import "./filters/format-number";
```

**Step 2: Implement**

Create `packages/intl-extra/src/main/lib/filters/format-number.ts`:

```ts
import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";

type NumberAttrs = Record<string, number | boolean>;

const UNSUPPORTED_STYLES = new Set(['spellout', 'duration']);

const mapAttrs = (attrs: NumberAttrs): Intl.NumberFormatOptions => {
    const options: Intl.NumberFormatOptions = {};
    for (const [key, value] of Object.entries(attrs)) {
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

const formatNumber = (
    number: number,
    attrs: NumberAttrs,
    style: string,
    locale: string | null | undefined,
    numberFormatterPrototype?: Intl.NumberFormat
): string => {
    const resolvedLocale = locale
        || numberFormatterPrototype?.resolvedOptions().locale
        || new Intl.NumberFormat().resolvedOptions().locale;
    const styleOptions = mapStyle(style);
    const attrOptions = mapAttrs(attrs);
    const formatter = new Intl.NumberFormat(resolvedLocale, {...styleOptions, ...attrOptions});
    return formatter.format(number);
};

const formatCurrency = (
    amount: number,
    currency: string,
    attrs: NumberAttrs,
    locale: string | null | undefined,
    numberFormatterPrototype?: Intl.NumberFormat
): string => {
    const resolvedLocale = locale
        || numberFormatterPrototype?.resolvedOptions().locale
        || new Intl.NumberFormat().resolvedOptions().locale;
    const options: Intl.NumberFormatOptions = {style: 'currency', currency, ...mapAttrs(attrs)};
    return new Intl.NumberFormat(resolvedLocale, options).format(amount);
};

export const formatCurrencyFilter: TwingCallable = async (
    _ctx, amount: number, currency: string, attrs: NumberAttrs = {}, locale?: string
) => formatCurrency(amount, currency, attrs, locale);

export const formatCurrencyFilterSynchronously: TwingSynchronousCallable = (
    _ctx, amount: number, currency: string, attrs: NumberAttrs = {}, locale?: string
) => formatCurrency(amount, currency, attrs, locale);

export const formatNumberFilter: TwingCallable = async (
    _ctx, number: number, attrs: NumberAttrs = {}, style: string = 'decimal', _type: string = 'default', locale?: string
) => formatNumber(number, attrs, style, locale);

export const formatNumberFilterSynchronously: TwingSynchronousCallable = (
    _ctx, number: number, attrs: NumberAttrs = {}, style: string = 'decimal', _type: string = 'default', locale?: string
) => formatNumber(number, attrs, style, locale);

// format_*_number wildcard: style comes first via nativeArguments
export const formatNumberStyleFilter: TwingCallable = async (
    _ctx, style: string, number: number, attrs: NumberAttrs = {}, _type: string = 'default', locale?: string
) => formatNumber(number, attrs, style, locale);

export const formatNumberStyleFilterSynchronously: TwingSynchronousCallable = (
    _ctx, style: string, number: number, attrs: NumberAttrs = {}, _type: string = 'default', locale?: string
) => formatNumber(number, attrs, style, locale);
```

Add to `packages/intl-extra/src/main/lib/index.ts`:

```ts
import {
    formatCurrencyFilter, formatCurrencyFilterSynchronously,
    formatNumberFilter, formatNumberFilterSynchronously,
    formatNumberStyleFilter, formatNumberStyleFilterSynchronously
} from "./filters/format-number";
```

In `createIntlExtension` filters array:

```ts
createFilter('format_currency', formatCurrencyFilter, [
    {name: 'currency'},
    {name: 'attrs', defaultValue: {}},
    {name: 'locale', defaultValue: null}
]),
createFilter('format_number', formatNumberFilter, [
    {name: 'attrs', defaultValue: {}},
    {name: 'style', defaultValue: 'decimal'},
    {name: 'type', defaultValue: 'default'},
    {name: 'locale', defaultValue: null}
]),
createFilter('format_*_number', formatNumberStyleFilter, [
    {name: 'attrs', defaultValue: {}},
    {name: 'type', defaultValue: 'default'},
    {name: 'locale', defaultValue: null}
]),
```

Same for synchronous extension.

**Step 3: Build and test**

```bash
cd /var/www/forks/twing/packages/intl-extra && pnpm run build:main && pnpm run build:test && pnpm run test
```

Expected: all format-number tests PASS. If currency formatting has non-breaking space differences, update expected strings to match actual Node 20 output (use ` ` for non-breaking space).

**Step 4: Commit**

```bash
git add packages/intl-extra/src/
git commit -m "feat(intl-extra): add format_currency, format_number, format_*_number filters"
```

---

## Task 7: Date format filters

Implements `format_datetime`, `format_date`, `format_time`.

**Files:**
- Create: `packages/intl-extra/src/main/lib/filters/format-date.ts`
- Create: `packages/intl-extra/src/test/tests/filters/format-date.ts`
- Modify: `packages/intl-extra/src/main/lib/index.ts`
- Modify: `packages/intl-extra/src/test/tests/index.ts`

**Step 1: Write failing tests**

Create `packages/intl-extra/src/test/tests/filters/format-date.ts`:

```ts
import {runCase} from "../../harness";
import {DateTime} from "luxon";

const date = DateTime.fromISO('2024-01-15T13:37:00.000Z');

runCase({
    description: 'format_date filter: medium format in English',
    template: `{{ date|format_date('medium', '', 'UTC', 'gregorian', 'en') }}`,
    context: {date},
    expectation: 'Jan 15, 2024'
});

runCase({
    description: 'format_date filter: long format',
    template: `{{ date|format_date('long', '', 'UTC', 'gregorian', 'en') }}`,
    context: {date},
    expectation: 'January 15, 2024'
});

runCase({
    description: 'format_time filter: medium format',
    template: `{{ date|format_time('medium', '', 'UTC', 'gregorian', 'en') }}`,
    context: {date},
    expectation: '1:37:00 PM'
});

runCase({
    description: 'format_datetime filter: medium/medium',
    template: `{{ date|format_datetime('medium', 'medium', '', 'UTC', 'gregorian', 'en') }}`,
    context: {date},
    expectation: 'Jan 15, 2024, 1:37:00 PM'
});

runCase({
    description: 'format_datetime filter: none date (time only)',
    template: `{{ date|format_datetime('none', 'short', '', 'UTC', 'gregorian', 'en') }}`,
    context: {date},
    expectation: '1:37 PM'
});

runCase({
    description: 'format_date filter: invalid format throws',
    template: `{{ date|format_date('invalid') }}`,
    context: {date},
    expectedErrorMessage: 'TwingRuntimeError: "invalid" is not a valid date format, known formats are: "none", "short", "medium", "long", "full" in "index.twig" at line 1, column 7'
});

runCase({
    description: 'format_date filter: null uses current date (just check it renders)',
    template: `{{ null|format_date('short', '', 'UTC', 'gregorian', 'en') }}`,
    trimmedExpectation: undefined
});
```

> The `null` date test uses `trimmedExpectation: undefined` to just verify it doesn't throw. Adjust if a cleaner assertion is needed.

Add to `packages/intl-extra/src/test/tests/index.ts`:

```ts
import "./filters/display-names";
import "./filters/country-timezones";
import "./filters/format-number";
import "./filters/format-date";
```

**Step 2: Implement**

Create `packages/intl-extra/src/main/lib/filters/format-date.ts`:

```ts
import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";
import {DateTime} from "luxon";

type DateStyle = 'none' | 'short' | 'medium' | 'long' | 'full';
const VALID_FORMATS: DateStyle[] = ['none', 'short', 'medium', 'long', 'full'];

const validateFormat = (format: string, paramName: string): void => {
    if (!VALID_FORMATS.includes(format as DateStyle)) {
        throw new Error(`"${format}" is not a valid ${paramName} format, known formats are: "none", "short", "medium", "long", "full"`);
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
    return timezone;
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

export const makeFormatDatetime = (dateFormatterPrototype?: Intl.DateTimeFormat) => {
    const impl = (
        value: DateTime | string | null,
        dateFormat: string = 'medium',
        timeFormat: string = 'medium',
        _pattern: string = '',
        timezone: string | false | null = null,
        calendar: string = 'gregorian',
        locale?: string
    ): string => {
        if (_pattern) {
            throw new Error('ICU date patterns are not supported; use dateFormat/timeFormat style names instead');
        }
        validateFormat(dateFormat, 'date');
        validateFormat(timeFormat, 'time');

        const date = toDate(value);
        const resolvedLocale = resolveLocale(locale, dateFormatterPrototype);
        const options = buildOptions(dateFormat, timeFormat, timezone, calendar, dateFormatterPrototype);

        return new Intl.DateTimeFormat(resolvedLocale, options).format(date);
    };
    return impl;
};

export const makeFormatDate = (dateFormatterPrototype?: Intl.DateTimeFormat) => {
    const formatDatetime = makeFormatDatetime(dateFormatterPrototype);
    return (
        value: DateTime | string | null,
        dateFormat: string = 'medium',
        pattern: string = '',
        timezone: string | false | null = null,
        calendar: string = 'gregorian',
        locale?: string
    ): string => formatDatetime(value, dateFormat, 'none', pattern, timezone, calendar, locale);
};

export const makeFormatTime = (dateFormatterPrototype?: Intl.DateTimeFormat) => {
    const formatDatetime = makeFormatDatetime(dateFormatterPrototype);
    return (
        value: DateTime | string | null,
        timeFormat: string = 'medium',
        pattern: string = '',
        timezone: string | false | null = null,
        calendar: string = 'gregorian',
        locale?: string
    ): string => formatDatetime(value, 'none', timeFormat, pattern, timezone, calendar, locale);
};

export const makeFormatDatetimeFilter = (dateFormatterPrototype?: Intl.DateTimeFormat): TwingCallable =>
    async (_ctx, ...args: any[]) => makeFormatDatetime(dateFormatterPrototype)(...(args as any));

export const makeFormatDatetimeFilterSynchronously = (dateFormatterPrototype?: Intl.DateTimeFormat): TwingSynchronousCallable =>
    (_ctx, ...args: any[]) => makeFormatDatetime(dateFormatterPrototype)(...(args as any));

export const makeFormatDateFilter = (dateFormatterPrototype?: Intl.DateTimeFormat): TwingCallable =>
    async (_ctx, ...args: any[]) => makeFormatDate(dateFormatterPrototype)(...(args as any));

export const makeFormatDateFilterSynchronously = (dateFormatterPrototype?: Intl.DateTimeFormat): TwingSynchronousCallable =>
    (_ctx, ...args: any[]) => makeFormatDate(dateFormatterPrototype)(...(args as any));

export const makeFormatTimeFilter = (dateFormatterPrototype?: Intl.DateTimeFormat): TwingCallable =>
    async (_ctx, ...args: any[]) => makeFormatTime(dateFormatterPrototype)(...(args as any));

export const makeFormatTimeFilterSynchronously = (dateFormatterPrototype?: Intl.DateTimeFormat): TwingSynchronousCallable =>
    (_ctx, ...args: any[]) => makeFormatTime(dateFormatterPrototype)(...(args as any));
```

Update `packages/intl-extra/src/main/lib/index.ts` — the factories now receive `dateFormatterPrototype` and `numberFormatterPrototype`. Replace the stub factories:

```ts
import {
    makeFormatDatetimeFilter, makeFormatDatetimeFilterSynchronously,
    makeFormatDateFilter, makeFormatDateFilterSynchronously,
    makeFormatTimeFilter, makeFormatTimeFilterSynchronously
} from "./filters/format-date";

// args shared by format_datetime
const datetimeArgs = [
    {name: 'dateFormat', defaultValue: 'medium'},
    {name: 'timeFormat', defaultValue: 'medium'},
    {name: 'pattern', defaultValue: ''},
    {name: 'timezone', defaultValue: null},
    {name: 'calendar', defaultValue: 'gregorian'},
    {name: 'locale', defaultValue: null}
];
const dateArgs = [
    {name: 'dateFormat', defaultValue: 'medium'},
    {name: 'pattern', defaultValue: ''},
    {name: 'timezone', defaultValue: null},
    {name: 'calendar', defaultValue: 'gregorian'},
    {name: 'locale', defaultValue: null}
];
const timeArgs = [
    {name: 'timeFormat', defaultValue: 'medium'},
    {name: 'pattern', defaultValue: ''},
    {name: 'timezone', defaultValue: null},
    {name: 'calendar', defaultValue: 'gregorian'},
    {name: 'locale', defaultValue: null}
];

export const createIntlExtension = (
    dateFormatterPrototype?: Intl.DateTimeFormat,
    numberFormatterPrototype?: Intl.NumberFormat
): TwingExtension => ({
    filters: [
        // ... existing filters ...
        createFilter('format_datetime', makeFormatDatetimeFilter(dateFormatterPrototype), datetimeArgs),
        createFilter('format_date', makeFormatDateFilter(dateFormatterPrototype), dateArgs),
        createFilter('format_time', makeFormatTimeFilter(dateFormatterPrototype), timeArgs),
    ],
    // ...
});
```

Same for `createSynchronousIntlExtension`.

**Step 3: Build and test**

```bash
cd /var/www/forks/twing/packages/intl-extra && pnpm run build:main && pnpm run build:test && pnpm run test
```

Expected: all format-date tests PASS. Verify the exact output strings match Node 20 Intl output and adjust expected values in the test file if needed.

**Step 4: Commit**

```bash
git add packages/intl-extra/src/
git commit -m "feat(intl-extra): add format_datetime, format_date, format_time filters"
```

---

## Task 8: Functions

Implements all 7 Twig functions.

**Files:**
- Create: `packages/intl-extra/src/main/lib/functions/intl-functions.ts`
- Create: `packages/intl-extra/src/test/tests/functions/intl-functions.ts`
- Modify: `packages/intl-extra/src/main/lib/index.ts`
- Modify: `packages/intl-extra/src/test/tests/index.ts`

**Step 1: Write failing tests**

Create `packages/intl-extra/src/test/tests/functions/intl-functions.ts`:

```ts
import {runCase} from "../../harness";

runCase({
    description: 'country_timezones function: NL',
    template: `{{ country_timezones('NL')|join(', ') }}`,
    expectation: 'Europe/Amsterdam'
});

runCase({
    description: 'country_names function: returns a map with known entry',
    template: `{{ country_names('en')['US'] }}`,
    expectation: 'United States'
});

runCase({
    description: 'currency_names function: returns EUR name',
    template: `{{ currency_names('en')['EUR'] }}`,
    expectation: 'Euro'
});

runCase({
    description: 'timezone_names function: returns name for UTC',
    template: `{{ timezone_names('en')['UTC'] is not null ? 'yes' : 'no' }}`,
    expectation: 'yes'
});

runCase({
    description: 'language_names function: returns French',
    template: `{{ language_names('en')['fr'] }}`,
    expectation: 'French'
});

runCase({
    description: 'script_names function: returns Latin',
    template: `{{ script_names('en')['Latn'] }}`,
    expectation: 'Latin'
});

runCase({
    description: 'locale_names function: returns French',
    template: `{{ locale_names('en')['fr'] }}`,
    expectation: 'French'
});
```

Add to `packages/intl-extra/src/test/tests/index.ts`:

```ts
import "./filters/display-names";
import "./filters/country-timezones";
import "./filters/format-number";
import "./filters/format-date";
import "./functions/intl-functions";
```

**Step 2: Implement**

Create `packages/intl-extra/src/main/lib/functions/intl-functions.ts`:

```ts
import ct from "countries-and-timezones";
import languageCodes from "../data/iso-639-1.json";
import scriptCodes from "../data/iso-15924.json";

const getLocale = (locale: string | null | undefined): string =>
    locale?.replace('_', '-') || new Intl.DateTimeFormat().resolvedOptions().locale;

export const countryTimezonesFunction = (countryCode: string): string[] => {
    const timezones = ct.getTimezonesForCountry(countryCode);
    if (!timezones || timezones.length === 0) {
        throw new Error(`No timezones found for country "${countryCode}"`);
    }
    return timezones.map(tz => tz.name);
};

export const countryNamesFunction = (locale?: string): Map<string, string> => {
    const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'region'});
    const result = new Map<string, string>();
    for (const country of Object.values(ct.getAllCountries())) {
        const name = displayNames.of(country.id);
        if (name && name !== country.id) result.set(country.id, name);
    }
    return result;
};

export const currencyNamesFunction = (locale?: string): Map<string, string> => {
    const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'currency'});
    const result = new Map<string, string>();
    for (const code of Intl.supportedValuesOf('currency')) {
        const name = displayNames.of(code);
        if (name && name !== code) result.set(code, name);
    }
    return result;
};

export const timezoneNamesFunction = (locale?: string): Map<string, string> => {
    const resolvedLocale = getLocale(locale);
    const date = new Date(Date.UTC(2024, 0, 15));
    const result = new Map<string, string>();
    for (const tz of Intl.supportedValuesOf('timeZone')) {
        try {
            const parts = new Intl.DateTimeFormat(resolvedLocale, {
                timeZone: tz,
                timeZoneName: 'long'
            }).formatToParts(date);
            const tzPart = parts.find(p => p.type === 'timeZoneName');
            if (tzPart) result.set(tz, tzPart.value);
        } catch { /* skip invalid */ }
    }
    return result;
};

export const languageNamesFunction = (locale?: string): Map<string, string> => {
    const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'language'});
    const result = new Map<string, string>();
    for (const code of languageCodes as string[]) {
        const name = displayNames.of(code);
        if (name && name !== code) result.set(code, name);
    }
    return result;
};

export const scriptNamesFunction = (locale?: string): Map<string, string> => {
    const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'script'});
    const result = new Map<string, string>();
    for (const code of scriptCodes as string[]) {
        try {
            const name = displayNames.of(code);
            if (name && name !== code) result.set(code, name);
        } catch { /* skip unsupported script codes */ }
    }
    return result;
};

export const localeNamesFunction = languageNamesFunction;
```

Add to `packages/intl-extra/src/main/lib/index.ts` — import and register all 7 functions in both extension factories:

```ts
import {
    countryTimezonesFunction,
    countryNamesFunction,
    currencyNamesFunction,
    timezoneNamesFunction,
    languageNamesFunction,
    scriptNamesFunction,
    localeNamesFunction
} from "./functions/intl-functions";

// In both createIntlExtension and createSynchronousIntlExtension, functions array:
createFunction('country_timezones', async (_ctx, code: string) => countryTimezonesFunction(code), [{name: 'countryCode'}]),
createFunction('country_names', async (_ctx, locale?: string) => countryNamesFunction(locale), [{name: 'locale', defaultValue: null}]),
createFunction('currency_names', async (_ctx, locale?: string) => currencyNamesFunction(locale), [{name: 'locale', defaultValue: null}]),
createFunction('timezone_names', async (_ctx, locale?: string) => timezoneNamesFunction(locale), [{name: 'locale', defaultValue: null}]),
createFunction('language_names', async (_ctx, locale?: string) => languageNamesFunction(locale), [{name: 'locale', defaultValue: null}]),
createFunction('script_names', async (_ctx, locale?: string) => scriptNamesFunction(locale), [{name: 'locale', defaultValue: null}]),
createFunction('locale_names', async (_ctx, locale?: string) => localeNamesFunction(locale), [{name: 'locale', defaultValue: null}]),
```

For the synchronous extension, wrap with `createSynchronousFunction` and remove `async`:

```ts
createSynchronousFunction('country_timezones', (_ctx, code: string) => countryTimezonesFunction(code), [{name: 'countryCode'}]),
// ... same pattern for others
```

**Step 3: Build and test**

```bash
cd /var/www/forks/twing/packages/intl-extra && pnpm run build:main && pnpm run build:test && pnpm run test
```

Expected: all function tests PASS.

**Step 4: Commit**

```bash
git add packages/intl-extra/src/
git commit -m "feat(intl-extra): add country_timezones, country_names, currency_names, timezone_names, language_names, script_names, locale_names functions"
```

---

## Task 9: Wire prototype parameters through format filters

The `dateFormatterPrototype` and `numberFormatterPrototype` passed to `createIntlExtension` need to flow into the format filters. This task verifies the wiring works end-to-end with a test that uses a prototype.

**Files:**
- Modify: `packages/intl-extra/src/test/tests/filters/format-number.ts`
- Modify: `packages/intl-extra/src/test/tests/filters/format-date.ts`

**Step 1: Add prototype tests to format-number.ts**

```ts
runCase({
    description: 'format_number: locale from numberFormatterPrototype',
    template: `{{ 1234.5|format_number }}`,
    numberFormatterPrototype: new Intl.NumberFormat('de'),
    expectation: '1.234,5'
});
```

**Step 2: Add prototype tests to format-date.ts**

```ts
runCase({
    description: 'format_date: timezone from dateFormatterPrototype',
    template: `{{ date|format_date('medium', '', null, 'gregorian', 'en') }}`,
    context: {date: DateTime.fromISO('2024-01-15T13:37:00.000Z')},
    dateFormatterPrototype: new Intl.DateTimeFormat('en', {timeZone: 'America/New_York'}),
    expectation: 'Jan 15, 2024'
});
```

**Step 3: Rebuild and test**

```bash
cd /var/www/forks/twing/packages/intl-extra && pnpm run build:main && pnpm run build:test && pnpm run test
```

**Step 4: Commit**

```bash
git add packages/intl-extra/src/
git commit -m "test(intl-extra): add prototype wiring tests"
```

---

## Task 10: Add to workspace build/test scripts and final verification

**Files:**
- Modify: `/var/www/forks/twing/package.json`

**Step 1: Check the workspace build script in root `package.json`**

Look for `build:workspaces` and `test:workspaces` scripts. They should already pick up `packages/*` via the pnpm workspace — verify `packages/intl-extra` builds as part of the workspace:

```bash
cd /var/www/forks/twing && pnpm run build:workspaces
```

Expected: `@toppynl/twing-intl-extra` builds without errors.

```bash
pnpm run test:workspaces
```

Expected: intl-extra tests run and pass.

**Step 2: Add a changeset**

```bash
cd /var/www/forks/twing && pnpm run changeset
```

Select `@toppynl/twing-intl-extra`, type `minor`, description: `Initial release — port of twig/intl-extra`.

**Step 3: Final commit**

```bash
git add .changeset/ package.json
git commit -m "feat(intl-extra): add to workspace, initial changeset"
```

---

## Appendix: Common issues

**`countries-and-timezones` default import:** Use `import ct from "countries-and-timezones"`. If TypeScript complains about default import, add `"esModuleInterop": true` to `src/tsconfig.json` or use `import * as ct from "countries-and-timezones"`.

**Non-breaking spaces in currency output:** `Intl.NumberFormat` often uses ` ` (non-breaking space) between amount and currency symbol in some locales. Hard-code these in test expectations using the unicode escape.

**`Intl.DisplayNames` returning the input unchanged:** For unrecognised codes, `Intl.DisplayNames.of()` returns the input code rather than throwing. The implementations above check for this and throw a `TwingRuntimeError` instead.

**`timezone_name` winter vs summer:** The `getTimezoneDisplayName` helper always uses a January date to get the standard-time name (e.g. "Eastern Standard Time" not "Eastern Daylight Time"). If you need the generic name use `timeZoneName: 'longGeneric'` which gives "Eastern Time".

**Build order:** Always run `build:main` before `build:test`. The test build imports the main source via `@toppynl/twing` workspace resolution, not the built output — but rollup still needs to resolve types.
