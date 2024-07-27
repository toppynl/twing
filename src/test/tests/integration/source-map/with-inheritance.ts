import {runTest} from "../TestBase";

runTest({
    description: 'Source map supports template inheritance',
    templates: {
        'index.twig': `{% extends "parent.twig" %}
{% block content %}
Child content + {{ parent() }} + something after
{% endblock %}`,
        'parent.twig': `{% block content %}
Parent content
{%- endblock %}`
    },
    context: {},
    expectedSourceMapMappings: [
        {source: 'index.twig', generatedLine: 1, generatedColumn: 0, originalLine: 3, originalColumn: 0, name: 'text'},
        {source: 'parent.twig', generatedLine: 1, generatedColumn: 16, originalLine: 2, originalColumn: 0, name: 'text'},
        {source: 'index.twig', generatedLine: 1, generatedColumn: 30, originalLine: 3, originalColumn: 30, name: 'text'}
    ],
    expectation: `Child content + Parent content + something after
`
});
