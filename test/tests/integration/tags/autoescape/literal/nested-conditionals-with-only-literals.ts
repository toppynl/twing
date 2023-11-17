import {runTest} from "../../../TestBase";

runTest({
    description: '"autoescape" tag on nested conditionals with only literals',
    templates: {
        "index.twig": `
{% autoescape 'html' %}
{{ true ? (true ? "<br />" : "<br>") : "\n" }}
{% endautoescape %}
`
    },
    expectation: `
<br />
`
})
