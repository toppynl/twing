import {runTest} from "../TestBase";

runTest({
    description: 'auto-escaping escapes',
    templates: {
        "index.twig": `
{{ br }}
`
    },
    context: Promise.resolve({
        br: '<br/>'
    }),
    environmentOptions: {
        autoEscapingStrategy: "html"
    },
    trimmedExpectation: `
&lt;br/&gt;
`
})
