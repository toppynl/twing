import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"from" tag nested block';
    }

    getTemplates() {
        return {
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
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: Unknown function "linput" in "index.twig" at line 6.';
    }
}

runTest(createIntegrationTest(new Test));
