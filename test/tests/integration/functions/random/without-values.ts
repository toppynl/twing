import {runTest} from "../../TestBase";

runTest({
    description: '"random" function without values',
    templates: {
        "index.twig": `
{{ random() >= 0 }}
{{ random(max=0) == 0 }}
`
    },
    expectation: `
1
1
`
});
