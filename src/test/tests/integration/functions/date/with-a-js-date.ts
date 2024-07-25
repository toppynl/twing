import {runTest} from "../../TestBase";

runTest({
    description: '"date" function with a JS date',
    templates: {
        "index.twig": `
{% set date = date(date) %}
{{ date|date(timezone="UTC") }}
`
    },
    context: Promise.resolve({
        date: new Date('2000-01-01T00:00:00Z') // this is UTC
    }),
    trimmedExpectation: 'January 1, 2000 00:00'
});
