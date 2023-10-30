import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"import" tag nested blocks with global macro';
    }

    getTemplates() {
        return {
            'index.twig': `
{%- import _self as macros %}

{% block foo %}
    {% block bar %}
        {{- macros.input('username') }}
    {% endblock %}
{% endblock %}

{% macro input(name) -%}
    <input name="{{ name }}">
{% endmacro %}
`
        };
    }

    getExpected() {
        return `
<input name="username">
`;
    }

}

runTest(createIntegrationTest(new Test));
