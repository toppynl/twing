import {runTest} from "../../TestBase";

runTest({
    description: '"dump" function with number',
    templates: {
        "index.twig": `
{{ dump(0) }}
{{ dump(5) }}
{{ dump(5.5) }}
`
    },
    trimmedExpectation: `
int(0)

int(5)

float(5.5)
`
});
