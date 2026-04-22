import {runCase} from "../harness";

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
    expectedErrorMessage: 'TwingRuntimeError: The "spellout" number style is not supported by the built-in Intl API in "index.twig" at line 1, column 7'
});
