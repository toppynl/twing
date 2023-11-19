import {runTest} from "../TestBase";

runTest({
    description: 'autoescape + "name" strategy',
    templates: {
        'index.twig': `
{{ br -}}
{{ include('index.js.twig') -}}
{{ include('index.html.twig') -}}
{{ include('index.txt.twig') -}}
{{ include('index.css.twig') -}}
{{ include('index.css') -}}`,
        'index.txt.twig': `
{{ br -}}`,
        'index.html.twig': `
{{ br -}}`,
        'index.js.twig': `
{{ br -}}`,
        'index.css.twig': `
{{ br -}}`,
        'index.css': `
{{ br -}}`
    },
    trimmedExpectation:
        `
&lt;br /&gt;
\\u003Cbr\\u0020\\/\\u003E
&lt;br /&gt;
<br />
\\3C br\\20 \\2F \\3E 
\\3C br\\20 \\2F \\3E 
`,
    context: Promise.resolve({
        br: '<br />'
    }),
    environmentOptions: {
        autoEscapingStrategy: 'name'
    }
});
