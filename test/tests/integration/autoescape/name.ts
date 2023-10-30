import {runTest} from "../TestBase";

runTest({
    description: 'autoescape + "name" strategy',
    templates: {
        'index.twig': `
{{ br -}}
{{ include('index.js.twig') -}}
{{ include('index.html.twig') -}}
{{ include('index.txt.twig') -}}`,
        'index.txt.twig': `
{{ br -}}`,
        'index.html.twig': `
{{ br -}}`,
        'index.js.twig': `
{{ br -}}`
    },
    expectation:
        `
&lt;br /&gt;
\\u003Cbr\\u0020\\/\\u003E
&lt;br /&gt;
<br />
`,
    context: Promise.resolve({
        br: '<br />'
    }),
    environmentOptions: {
        escapingStrategy: 'name'
    }
});
