import {runTest} from "../../TestBase";

runTest({
    description: '"dump" function with boolean',
    templates: {
        "index.twig": `
{{ dump(null) }}
{{ dump(functions.undefined()) }}
`
    },
    context: {
        functions: {
            undefined: () => undefined
        }
    },
    trimmedExpectation: `
NULL

NULL
`
});
