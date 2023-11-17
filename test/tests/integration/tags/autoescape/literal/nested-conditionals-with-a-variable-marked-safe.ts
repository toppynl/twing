import {runTest} from "../../../TestBase";

runTest({
    description: '"autoescape" tag on nested conditionals with a variable marked safe',
    templates: {
        "index.twig": `
{% autoescape 'html' %}
{{ true ? (true ? "<br />" : someVar|raw) : "\n" }}
{{ true ? (false ? "<br />" : someVar|raw) : "\n" }}
{{ true ? (true ? someVar|raw : "<br />") : "\n" }}
{{ true ? (false ? someVar|raw : "<br />") : "\n" }}
{{ false ? "\n" : (true ? someVar|raw : "<br />") }}
{{ false ? "\n" : (false ? someVar|raw : "<br />") }}
{% endautoescape %}
`
    },
    context: Promise.resolve({
        'someVar': '<br />',
    }),
    expectation: `
<br />
<br />
<br />
<br />
<br />
<br />
`
})
