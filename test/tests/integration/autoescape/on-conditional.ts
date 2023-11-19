import {runTest} from "../TestBase";

runTest({
    description: 'Auto-escaping on conditional',
    templates: {
        "index.twig": `
{{ foo ?? bar }}
{{ "<br/>" ?? "<br/>" }}
{{ foo ?? "<br/>" }}
{{ "<br/>" ?? foo }}
{{ true ? foo : "<br/>" }}
{{ true ? "<br/>" : foo }}
`
    },
    context: Promise.resolve({
        foo: '<br/>',
        bar: '<br/>'
    }),
    trimmedExpectation: `
&lt;br/&gt;
<br/>
&lt;br/&gt;
<br/>
&lt;br/&gt;
<br/>
`
});
