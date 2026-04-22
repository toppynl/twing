import {runCase} from "../harness";
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
    expectedErrorMessage: 'TwingRuntimeError: "invalid" is not a valid date format, known formats are: "none", "short", "medium", "long", "full" in "index.twig" at line 1, column 9'
});

runCase({
    description: 'format_date: timezone from dateFormatterPrototype',
    template: `{{ date|format_date('medium', '', null, 'gregorian', 'en') }}`,
    context: {date: DateTime.fromISO('2024-01-15T03:00:00.000Z')},
    dateFormatterPrototype: new Intl.DateTimeFormat('en', {timeZone: 'America/New_York'}),
    expectation: 'Jan 14, 2024'
});
