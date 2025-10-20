import {runTest} from "../TestBase";

runTest({
    description: 'Source map supports set tag',
    templates: {
        'index.twig': `{% set content %}
{{ include("partial.twig") }}
{% endset %}
{{ content }}
{{ "index content" }}`,
        'partial.twig': `
{{ "partial content" }}
`
    },
    context: {},
    expectedSourceMapMappings: [
        {source: 'index.twig', generatedLine: 1, generatedColumn: 0, originalLine: 4, originalColumn: 0, name: 'print'},
        {source: 'index.twig', generatedLine: 2, generatedColumn: 0, originalLine: 4, originalColumn: 0, name: 'print'},
        {source: 'index.twig', generatedLine: 3, generatedColumn: 0, originalLine: 4, originalColumn: 0, name: 'print'},
        {source: 'index.twig', generatedLine: 4, generatedColumn: 0, originalLine: 4, originalColumn: 13, name: 'text'},
        {source: 'index.twig', generatedLine: 5, generatedColumn: 0, originalLine: 5, originalColumn: 0, name: 'print'},
    ],
    expectation: `
partial content


index content`
});
