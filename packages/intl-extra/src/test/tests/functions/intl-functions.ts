import {runCase} from "../harness";

runCase({
    description: 'country_timezones function: FR',
    template: `{{ country_timezones('FR')|join(', ') }}`,
    expectation: 'Europe/Paris'
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
