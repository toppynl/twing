import {runTest} from "../TestBase";

runTest({
    description: 'autoescape + block',
    templates: {
        'index.twig': `{{ include('template.html.twig') -}}`,
        'unrelated.txt.twig': `
{% block content %}{% endblock %}`,
        'template.html.twig': `{% extends 'parent.html.twig' %}
{% block content %}
{{ br -}}
{% endblock %}`,
        'parent.html.twig': `{% set _content = block('content')|raw %}
{{ _content|raw }}`
    },
    trimmedExpectation: `
&lt;br /&gt;
`,
    context: Promise.resolve({
        br: '<br />'
    }),
    environmentOptions: {
        autoEscapingStrategy: 'name'
    }
});
