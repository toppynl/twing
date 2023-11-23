import {runTest} from "../../TestBase";

runTest({
    description: '"default" filter with no argument',
    templates: {
        "index.twig": `
{{ foo|default() }}
`
    },
    trimmedExpectation: `
`
});
