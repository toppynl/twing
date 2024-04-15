import {runTest} from "../../TestBase";

runTest({
    description: '"sandbox" tag within a sandboxed environment',
    templates: {
        "index.twig": `
{% sandbox %}
{% include "partial" %}
{% endsandbox %}
{{ foo.bar }}
`,
        'partial': `{{ "foo"|upper }}`
    },
    sandboxSecurityPolicyFilters: ['upper'],
    sandboxSecurityPolicyTags: ['sandbox', 'include'],
    sandboxed: true,
    context: Promise.resolve({
        foo: {
            bar: 'foo.bar'
        }
    }),
    expectedErrorMessage: 'TwingRuntimeError: Calling "bar" property on an instance of Object is not allowed in "index.twig" at line 5, column 4.'
})
