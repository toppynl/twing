import {runTest} from "../../TestBase";

runTest({
    description: '"sandbox" tag with missing variable',
    templates: {
        "index.twig": `{% sandbox %}
{% include "foo.twig" %}
{% endsandbox %}
`,
        'foo.twig': `{{ foo }}`
    },
    environmentOptions: {
        strictVariables: false
    },
    expectation: ''
});