import {runTest} from "../../TestBase";

runTest({
    description: 'Nested arrays are supported',
    templates: {
        "index.twig": `
{% set a = [1, 2, [1, 2]] %}
{{ a }}
{{ a|join }}
{{ jsArray }}
{{ jsArray|join }}
`
    },
    expectation: `
Array
12Array
Array
12Array
`,
    context: {
        jsArray: [1, 2, [1, 2]]
    }
});
