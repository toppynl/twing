import {runTest} from "../../TestBase";

runTest({
    description: '"dump" function with boolean',
    templates: {
        "index.twig": `
{{ dump(null) }}
{{ dump(functions.undefined()) }}
`
    },
    context: Promise.resolve({
        functions: {
            undefined: () => undefined
        }
    }),
    trimmedExpectation: `
NULL

NULL
`
});
