import {runTest} from "../../TestBase";

runTest({
    description: '"is in" test on hash',
    templates: {
        "index.twig": `
{{ 5 in {} ? 1 : 0 }}
{{ 5 in {0: 5} ? 1 : 0 }}
{{ 5 in {0: 4, 1: 5} ? 1 : 0 }}
{{ null in {0: 4, 1: 5} ? 1 : 0 }}
`
    },
    expectation: `
0
1
1
0
`
});