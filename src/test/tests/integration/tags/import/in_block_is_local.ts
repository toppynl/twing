import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"import" tag in block is local';
    }

    getTemplates() {
        return {
            'index.twig': `
{% block foo %}
    {%- import _self as lmacros %}
{% endblock %}

{% block bar %}
    {{- lmacros.input('username') }}
{% endblock %}

{% macro input(name) -%}
    <input name="{{ name }}">
{% endmacro %}
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Variable "lmacros" does not exist in "index.twig" at line 7, column 9.';
    }
}

runTest(createIntegrationTest(new Test));
