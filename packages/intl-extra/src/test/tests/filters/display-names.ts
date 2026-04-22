import {runCase} from "../harness";

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
    expectedErrorMessage: 'TwingRuntimeError: Unable to get the country name for "XX" in "index.twig" at line 1, column 9'
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
    expectedErrorMessage: 'TwingRuntimeError: Unable to get the timezone name for "Invalid/Zone" in "index.twig" at line 1, column 19'
});
