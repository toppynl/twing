import {runTest} from "../../TestBase";

runTest({
    description: '"arrow" expression using long syntax is not confused with another expression',
    templates: {
        "index.twig": `
{% set sizes = [34, 36, 38, 40, 42] %}

{{ sizes|join((', ')) }}
{{ sizes|filter((value) => (value > 38))|join(', ') }}
{{ sizes|map((value, key) => "#{key}:#{value}")|join(', ') }}
`
    },
    expectation: `
34, 36, 38, 40, 42
40, 42
0:34, 1:36, 2:38, 3:40, 4:42`
});

runTest({
    description: '"arrow" expression using long syntax is not confused with another expression',
    templates: {
        "index.twig": `
{% set sizes = [34, 36, 38, 40, 42] %}

{{ sizes|filter((5) => (5 > 38)) }}
`
    },
    expectedErrorMessage: `TwingParsingError: Unexpected token "number" of value "5" in "index.twig" at line 4, column 18.`
});
