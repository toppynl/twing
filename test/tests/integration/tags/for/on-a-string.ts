import {runTest} from "../../TestBase";

runTest({
    description: '"for" tag supports being passed as string as iterator...and does nothing',
    templates: {
        "index.twig": `
{% for letter in "foo" %}
{{ letter }}
{% endfor %}
`
    },
    expectation: ''
});
