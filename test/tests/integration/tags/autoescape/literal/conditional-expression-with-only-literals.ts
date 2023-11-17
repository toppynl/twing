import {runTest} from "../../../TestBase";

runTest({
    description: '"autoescape" tag on conditional expression with only literals',
    templates: {
        "index.twig": `
{% autoescape 'html' %}
{{ true ? "<br />" : "<br>" }}
{% endautoescape %}
`
    },
    expectation: `
<br />
`
})
