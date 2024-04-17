import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"import" tag local override';
    }

    getTemplates() {
        return {
            'index.twig': `
{%- import _self as macros %}

{% block foo %}
    {%- import "macros" as macros %}
    {{- macros.input('username') }}
{% endblock %}

{% block bar %}
    {{- macros.input('username') }}
{% endblock %}

{% macro input(name) -%}
    <input name="{{ name }}">
{% endmacro %}
`,
            'macros': `
{% macro input(name) %}
    <input name="{{ name }}" value="local">
{% endmacro %}
`
        };
    }

    getExpected() {
        return `
<input name="username" value="local">


<input name="username">
`;
    }

}

runTest(createIntegrationTest(new Test));
