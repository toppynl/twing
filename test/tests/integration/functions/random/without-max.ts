import {runTest} from "../../TestBase";

runTest({
    description: '"random" function without max',
    templates: {
        "index.twig": `
{% set random1 = random(-1) %}
{{ random1 == 0 or random1 == -1 }}
{% set random2 = random(1) %}
{{ random2 == 0 or random2 == 1 }}
`
    },
    trimmedExpectation: `
1
1
`
});
