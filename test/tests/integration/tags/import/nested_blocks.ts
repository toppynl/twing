import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"import" tag nested blocks';
    }

    getTemplates() {
        return {
            'index.twig': `
{% block foo %}
    {%- import _self as lmacros %}

    {% block bar %}
        {{- lmacros.input('username') }}
    {% endblock %}
{% endblock %}

{% macro input(name) -%}
    <input name="{{ name }}">
{% endmacro %}
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Variable "lmacros" does not exist in "index.twig" at line 6, column 13.';
    }
}

runTest(createIntegrationTest(new Test));
