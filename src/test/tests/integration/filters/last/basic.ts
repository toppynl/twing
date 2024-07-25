import {runTest} from "../../TestBase";

runTest({
    description: '"last" filter',
    templates: {
        "index.twig": `
{{ "foo"|last }}
{{ ["a", "b"]|last }}
`
    },
    trimmedExpectation: `
o
b
`
});
