import {runTest} from "../../TestBase";

runTest({
    description: '"sandbox" tag with an embed tag',
    templates: {
        "index.twig": `{% sandbox %}
{% embed "foo.twig" %}{% endembed %}
{% endsandbox %}
`,
        'foo.twig': 'Foo'
    },
    expectation: 'Foo'
});
