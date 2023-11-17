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
    expectation: `
&lt;br/&gt;
`
})
