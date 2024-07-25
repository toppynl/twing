import {runTest} from "../../../TestBase";

runTest({
    description: '"autoescape" tag on nested conditionals with a variable',
    templates: {
        "index.twig": `
{% autoescape 'html' %}
{{ true ? (true ? "<br />" : someVar) : "\n" }}
{{ true ? (false ? "<br />" : someVar) : "\n" }}
{{ true ? (true ? someVar : "<br />") : "\n" }}
{{ true ? (false ? someVar : "<br />") : "\n" }}
{{ false ? "\n" : (true ? someVar : "<br />") }}
{{ false ? "\n" : (false ? someVar : "<br />") }}
{% endautoescape %}
`
    },
    context: Promise.resolve({
        someVar: '<br />'
    }),
    trimmedExpectation: `
<br />
&lt;br /&gt;
&lt;br /&gt;
<br />
&lt;br /&gt;
<br />
`
})
