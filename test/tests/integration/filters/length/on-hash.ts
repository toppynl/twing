import {runTest} from "../../TestBase";

runTest({
    description: '"length" filter on hash',
    templates: {
        "index.twig": `
{{ {}|length }}
{{ {0: 1}|length }}
{{ {0: 1, 1: 2}|length }}
{{ jsMap|length }}
`
    },
    context: Promise.resolve({
        jsMap: new Map([[0, 1], [1, 2]])
    }),
    expectation: `
0
1
2
2
`
});