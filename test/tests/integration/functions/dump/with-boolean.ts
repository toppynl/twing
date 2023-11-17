import {runTest} from "../../TestBase";

runTest({
    description: '"dump" function with boolean',
    templates: {
        "index.twig": `
{{ dump(true) }}
{{ dump(false) }}
`
    },
    expectation: `
bool(true)

bool(false)
`
});
