import {runTest} from "../../../TestBase";

runTest({
    description: '"autoescape" tag on conditional expression with a variable',
    templates: {
        "index.twig": `
{% autoescape 'html' %}
{{ true ? "<br />" : someVar }}
{{ false ? "<br />" : someVar }}
{{ true ? someVar : "<br />" }}
{{ false ? someVar : "<br />" }}
{{ "<br />" ?: someVar }}
{{ someFalseVar ?: "<br />" }}
{{ aaaa ?? "<br />" }}
{{ "<br />" ?? someVar }}
{% endautoescape %}
`
    },
    context: Promise.resolve({
        someVar: '<br />',
        someFalseVar: false
    }),
    trimmedExpectation: `
<br />
&lt;br /&gt;
&lt;br /&gt;
<br />
<br />
<br />
<br />
<br />
`
})
