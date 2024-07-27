import {runTest} from "../../TestBase";

runTest({
    description: 'missing attribute call on the context',
    templates: {
        "index.twig": `
{% set a = 5 %}
{{ _context[1] }}
`
    },
    expectedErrorMessage: `TwingRuntimeError: Index "1" is out of bounds for array [5] in "index.twig" at line 3, column 4.`
});
