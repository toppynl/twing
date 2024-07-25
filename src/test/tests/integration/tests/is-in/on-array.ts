import {runTest} from "../../TestBase";

runTest({
    description: '"is in" test on array',
    templates: {
        "index.twig": `
{{ 5 in [] ? 1 : 0 }}
{{ 5 in [5] ? 1 : 0 }}
{{ 5 in [4, 5] ? 1 : 0 }}
{{ null in [4, 5] ? 1 : 0 }}
`
    },
    expectation: `
0
1
1
0
`
});