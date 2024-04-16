import {runTest} from "../../../TestBase";

runTest({
    description: '"autoescape" tag on conditional expression with a variable',
    templates: {
        "index.twig": `
{% set br = "<br />" %}
{% autoescape 'html' %}
{{ true ? "<br />" : br }}
{{ false ? "<br />" : br }}
{{ "<br />" ?? br }}
{{ br ?? "<br />" }}
{% endautoescape %}
`
    },
    trimmedExpectation: `
<br />
&lt;br /&gt;
<br />
&lt;br /&gt;
`
})
