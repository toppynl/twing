import {runTest} from "../../TestBase";

runTest({
    description: 'missing attribute call on a hash',
    templates: {
        "index.twig": `
{% set a = {0: 1} %}
{{ a[1] }}
`
    },
    expectedErrorMessage: `TwingRuntimeError: Index "1" is out of bounds for array [1] in "index.twig" at line 3, column 4.`
});