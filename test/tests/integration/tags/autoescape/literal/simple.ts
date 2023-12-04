import {runTest} from "../../../TestBase";

runTest({
    description: '"autoescape" tag on literal',
    templates: {
        "index.twig": `
{% autoescape 'html' %}
{{ "<br />" }}
{{ "<br />"|escape }}
{% endautoescape %}
`
    },
    trimmedExpectation: `
<br />
&lt;br /&gt;
`
})
