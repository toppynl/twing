import {runTest} from "../TestBase";

runTest({
    description: 'Source map supports template inclusion',
    templates: {
        'index.twig': `
{{ include("partial.twig") }}
{{ "index content" }}
`,
        'partial.twig': `
{{ include("partial2.twig") }}
{{ "partial content" }}
`,
        'partial2.twig': `
 {{ "partial 2 content" }}
`
    },
    context: {},
    expectedSourceMapMappings: [
        {source: 'index.twig', generatedLine: 1, generatedColumn: 0, originalLine: 1, originalColumn: 0, name: 'text'},
        {source: 'partial.twig', generatedLine: 2, generatedColumn: 0, originalLine: 1, originalColumn: 0, name: 'text'},
        {source: 'partial2.twig', generatedLine: 3, generatedColumn: 0, originalLine: 1, originalColumn: 0, name: 'text'},
        {source: 'partial2.twig', generatedLine: 4, generatedColumn: 0, originalLine: 1, originalColumn: 0, name: 'text'},
        {source: 'partial2.twig', generatedLine: 4, generatedColumn: 1, originalLine: 2, originalColumn: 1, name: 'print'},
        {source: 'partial2.twig', generatedLine: 4, generatedColumn: 18, originalLine: 2, originalColumn: 26, name: 'text'},
        {source: 'partial.twig', generatedLine: 5, generatedColumn: 0, originalLine: 2, originalColumn: 30, name: 'text'},
        {source: 'partial.twig', generatedLine: 6, generatedColumn: 0, originalLine: 3, originalColumn: 0, name: 'print'},
        {source: 'partial.twig', generatedLine: 6, generatedColumn: 15, originalLine: 3, originalColumn: 23, name: 'text'},
        {source: 'index.twig', generatedLine: 7, generatedColumn: 0, originalLine: 2, originalColumn: 29, name: 'text'},
        {source: 'index.twig', generatedLine: 8, generatedColumn: 0, originalLine: 3, originalColumn: 0, name: 'print'},
        {source: 'index.twig', generatedLine: 8, generatedColumn: 13, originalLine: 3, originalColumn: 21, name: 'text'}
    ],
    expectation: `


 partial 2 content

partial content

index content
`
});

runTest({
    description: 'Source map supports template inclusion using the include tag',
    templates: {
        'index.twig': `
{% include "partial.twig" %}
{{ "index content" }}
`,
        'partial.twig': `
{% include "partial2.twig" %}
{{ "partial content" }}
`,
        'partial2.twig': `
 {{ "partial 2 content" }}
`
    },
    context: {},
    expectedSourceMapMappings: [
        {source: 'index.twig', generatedLine: 1, generatedColumn: 0, originalLine: 1, originalColumn: 0, name: 'text'},
        {source: 'partial.twig', generatedLine: 2, generatedColumn: 0, originalLine: 1, originalColumn: 0, name: 'text'},
        {source: 'partial2.twig', generatedLine: 3, generatedColumn: 0, originalLine: 1, originalColumn: 0, name: 'text'},
        {source: 'partial2.twig', generatedLine: 4, generatedColumn: 0, originalLine: 1, originalColumn: 0, name: 'text'},
        {source: 'partial2.twig', generatedLine: 4, generatedColumn: 1, originalLine: 2, originalColumn: 1, name: 'print'},
        {source: 'partial2.twig', generatedLine: 4, generatedColumn: 18, originalLine: 2, originalColumn: 26, name: 'text'},
        {source: 'partial.twig', generatedLine: 5, generatedColumn: 0, originalLine: 3, originalColumn: 0, name: 'print'},
        {source: 'partial.twig', generatedLine: 5, generatedColumn: 15, originalLine: 3, originalColumn: 23, name: 'text'},
        {source: 'index.twig', generatedLine: 6, generatedColumn: 0, originalLine: 3, originalColumn: 0, name: 'print'},
        {source: 'index.twig', generatedLine: 6, generatedColumn: 13, originalLine: 3, originalColumn: 21, name: 'text'}
    ],
    expectation: `


 partial 2 content
partial content
index content
`
});
