import {runTest} from "../../TestBase";

runTest({
    description: 'An error is thrown when using parent() in a block not defined in the parent template',
    templates: {
        "index.twig": `
{% extends "parent.twig" %}
{% block foo %}
{{ parent() }}
{% endblock %}
`,
        'parent.twig': `
{% block bar %}
{% endblock %}
`
    },
    expectedErrorMessage: 'foo'
});
