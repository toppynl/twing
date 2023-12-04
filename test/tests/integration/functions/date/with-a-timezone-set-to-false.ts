import {runTest} from "../../TestBase";

runTest({
    description: '"date" function with timezone set to false',
    templates: {
        "index.twig": `
{% set date1 = date("2000-01-01T00:00:00Z", timezone=false) %}
{% set date2 = date("2000-01-01T00:00:00+0500", timezone=false) %}
{{ date1|date() }}
{{ date2|date() }}
`
    },
    trimmedExpectation: `
January 1, 2000 01:00
December 31, 1999 20:00
`
});
