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
    trimmedExpectation: '',
    expectedErrorMessage: 'TwingParsingError: Unknown function "linput" in "index.twig" at line 6, column 13.'
});

