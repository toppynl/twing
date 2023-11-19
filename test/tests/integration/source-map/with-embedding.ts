import {runTest} from "../TestBase";

runTest({
    description: 'Source map supports template inheritance',
    templates: {
        'index.twig': `{% embed "skeleton.twig" %}
    {% block content -%}
        Child content + {{ parent() }} + something after
    {%- endblock %}
{% endembed %}

{% embed "skeleton.twig" %}
    {% block content -%}
        Child content 2 + {{ parent() }} + something after
    {%- endblock %}
{% endembed %}

{% embed "skeleton2.twig" %}
    {% block content -%}
        Child content + {{ parent() }} + something after
    {%- endblock %}
{% endembed %}`,
        'skeleton.twig': `{% block content %}
Skeleton content
{%- endblock %}`,
        'skeleton2.twig': `{% block content %}
Skeleton 2 content
{%- endblock %}`
    },
    context: Promise.resolve({}),
    expectedSourceMapMappings: [
        {source: 'index.twig', generatedLine: 1, generatedColumn: 0, originalLine: 3, originalColumn: 0, name: 'text'},
        {source: 'skeleton.twig', generatedLine: 1, generatedColumn: 16, originalLine: 2, originalColumn: 0, name: 'text'},
        {source: 'index.twig', generatedLine: 1, generatedColumn: 32, originalLine: 3, originalColumn: 38, name: 'text'},
        {source: 'index.twig', generatedLine: 1, generatedColumn: 50, originalLine: 6, originalColumn: 0, name: 'text'},
        {source: 'index.twig', generatedLine: 2, generatedColumn: 0, originalLine: 9, originalColumn: 0, name: 'text'},
        {source: 'skeleton.twig', generatedLine: 2, generatedColumn: 18, originalLine: 2, originalColumn: 0, name: 'text'},
        {source: 'index.twig', generatedLine: 2, generatedColumn: 34, originalLine: 9, originalColumn: 40, name: 'text'},
        {source: 'index.twig', generatedLine: 2, generatedColumn: 52, originalLine: 12, originalColumn: 0, name: 'text'},
        {source: 'index.twig', generatedLine: 3, generatedColumn: 0, originalLine: 15, originalColumn: 0, name: 'text'},
        {source: 'skeleton2.twig', generatedLine: 3, generatedColumn: 16, originalLine: 2, originalColumn: 0, name: 'text'},
        {source: 'index.twig', generatedLine: 3, generatedColumn: 34, originalLine: 15, originalColumn: 38, name: 'text'}
    ],
    expectation: `Child content + Skeleton content + something after
Child content 2 + Skeleton content + something after
Child content + Skeleton 2 content + something after`
});
