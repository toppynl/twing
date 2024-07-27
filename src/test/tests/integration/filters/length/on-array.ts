import {runTest} from "../../TestBase";

runTest({
    description: '"length" filter on array',
    templates: {
        "index.twig": `
{{ []|length }}
{{ [1]|length }}
{{ [1, 2]|length }}
{{ jsArray|length }}
`
    },
    context: {
        jsArray: [1, 2]
    },
    expectation: `
0
1
2
2
`
});
