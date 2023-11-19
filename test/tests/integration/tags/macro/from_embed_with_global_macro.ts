import {runTest} from "../../TestBase";

runTest({
    description: '"macro" tag - from embed with global macro',
    templates: {
        'index.twig': `
{% from _self import input %}

{% embed 'embed' %}
    {% block foo %}
        {{ input("username") }}
    {% endblock %}
{% endembed %}

{% macro input(name) -%}
    <input name="{{ name }}">
{% endmacro %}`,
        'embed': `
    {% block foo %}
    {% endblock %}`
    },
    context: Promise.resolve({}),
    trimmedExpectation: '',
    expectedErrorMessage: 'TwingParsingError: Unknown function "input" in "index.twig" at line 6, column 12.'
});
