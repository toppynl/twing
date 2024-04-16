import {runTest} from "../../TestBase";

runTest({
    description: '"cycle" function on hash',
    templates: {
        "index.twig": `
{{ cycle({}, 0) }}
{{ cycle({0: 1}, 0) }}
{{ cycle({0: 1, 1: 2}, 0) }}
{{ cycle({0: 1, 1: 2}, 1) }}
{{ cycle({0: 1, 1: 2}, 2) }}
`
    },
    expectation: `

1
1
2
1
`
});
