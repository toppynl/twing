import {runTest} from "../../TestBase";

runTest({
    description: '"autoescape" tag with block function',
    templates: {
        "index.twig": `
{% autoescape "html" %}
{% set br = "<br/>" %}
{% block foo %}
{{ br }}
{% endblock %}
{{ block("foo") }}
{% endautoescape %}
`
    },
    expectation: `
&lt;br/&gt;
&lt;br/&gt;

`
})
