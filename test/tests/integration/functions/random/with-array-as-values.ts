import {runTest} from "../../TestBase";

runTest({
    description: '"random" function with array as values',
    templates: {
        "index.twig": `
{% set random1 = random([1,2]) %}
{{ random1 == 1 or random1 == 2 }}
`
    },
    trimmedExpectation: `
1
`
});

runTest({
    description: '"random" function with an empty array as values',
    templates: {
        "index.twig": `
{{ random([]) }}
`
    },
    expectedErrorMessage: `TwingRuntimeError: The random function cannot pick from an empty array in "index.twig" at line 2, column 4.`
});
