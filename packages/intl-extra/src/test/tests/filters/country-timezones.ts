import {runCase} from "../harness";

runCase({
    description: 'country_timezones filter: FR has Paris timezone',
    template: `{{ 'FR'|country_timezones|join(', ') }}`,
    expectation: 'Europe/Paris'
});

runCase({
    description: 'country_timezones filter: US has multiple timezones',
    template: `{{ 'US'|country_timezones|length > 1 ? 'yes' : 'no' }}`,
    expectation: 'yes'
});

runCase({
    description: 'country_timezones filter: invalid code throws',
    template: `{{ 'XX'|country_timezones }}`,
    expectedErrorMessage: 'TwingRuntimeError: No timezones found for country "XX" in "index.twig" at line 1, column 9'
});
