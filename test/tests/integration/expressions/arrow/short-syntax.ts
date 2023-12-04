import {runTest} from "../../TestBase";

runTest({
    description: '"arrow" expression using short syntax',
    templates: {
        "index.twig": `
{% set sizes = [34, 36, 38, 40, 42] %}

{{ sizes|filter(v => (v > 38))|join(', ') }}
`
    },
    trimmedExpectation: '40, 42'
});
