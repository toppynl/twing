import {runTest} from "../../TestBase";

runTest({
    description: '"autoescape" tag with parent function',
    templates: {
        "index.twig": `
{% extends "blocks.twig" %}
{% set br = "<br/>" %}
{% block foo %}
{% autoescape "html" %}
{{ parent() }}
{% endautoescape %}
{% endblock %}
`,
        'blocks.twig': `
{% autoescape "html" %}
{% block foo %}
{{ br }}
{% endblock %}
{% endautoescape %}
`
    },
    expectation: `
&lt;br/&gt;

`
})
