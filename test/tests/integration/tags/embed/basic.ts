import {runTest} from "../../TestBase";

runTest({
    description: '"embed" tag',
    templates: {
        'foo.twig': `
A
{% block c1 %}
    block1
{% endblock %}
B
{% block c2 %}
    block2
{% endblock %}
C`,
        'index.twig': `
FOO
{% embed "foo.twig" %}
    {% block c1 %}
        {{ parent() }}
        block1extended
    {% endblock %}
{% endembed %}

BAR`
    },
    trimmedExpectation: `
FOO

A
            block1

        block1extended
    B
    block2
C
BAR
`,
    type: "execution context"
});


