import {runTest} from "../../TestBase";

runTest({
   description: '"macro" tag - from nested blocks',
    templates: {
       'index.twig': `
{% block foo %}
    {%- from _self import input as linput %}

    {% block bar %}
        {{- linput('username') }}
    {% endblock %}
{% endblock %}

{% macro input(name) -%}
    <input name="{{ name }}">
{% endmacro %}
`
    },
    context: Promise.resolve({}),
    expectation: '',
    expectedErrorMessage: 'TwingErrorSyntax: Unknown "linput" function in "index.twig" at line 6.'
});

