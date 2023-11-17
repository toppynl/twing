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
    expectation: `
<br />
&lt;br /&gt;
`
})
