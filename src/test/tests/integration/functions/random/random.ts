import {runTest} from "../../TestBase";

runTest({
    description: '"random" function',
    templates: {
        'index.twig': `
{% set value = random(1,1) %}
{% if (value == 1) %}OK{% endif %}
{% set value = random("a","a") %}
{% if (value == "a") %}OK{% endif %}
`
    },
    context: Promise.resolve({}),
    trimmedExpectation: `OKOK`
});
