import {runTest} from "../TestBase";

runTest({
    description: 'Auto-escaping on nested conditionals',
    templates: {
        "index.twig": `
{{ bar ? (foo ?? foo) : "<br/>" }}
{{ bar ? "<br/>" : (foo ?? foo) }}
{{ bar ? (foo ?? foo) : (foo ?? foo) }}
{{ bar ? (foo ?? "<br/>") : ("<br/>" ?? "<br/>") }}
{{ bar ? ("<br/>" ?? "<br/>") : (foo ?? "<br/>") }}
`
    },
    context: Promise.resolve({
        foo: '<br/>',
        bar: true
    }),
    expectation: `
&lt;br/&gt;
<br/>
&lt;br/&gt;
&lt;br/&gt;
<br/>
`
});
