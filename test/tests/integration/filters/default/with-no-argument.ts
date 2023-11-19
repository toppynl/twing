import {runTest} from "../../TestBase";

runTest({
    description: '"default" filter with no argument',
    templates: {
        "index.twig": `
{{ null|default() }}
{{ foo|default() }}
{{ foo.bar|default() }}
`
    },
    trimmedExpectation: `
`
});
