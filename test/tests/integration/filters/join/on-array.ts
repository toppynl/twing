import {runTest} from "../../TestBase";

runTest({
    description: '"join" filter on array',
    templates: {
        "index.twig": `
{{ [1, 2, [1, 2]]|join }}
`
    },
    expectation: `
12Array
`
});
