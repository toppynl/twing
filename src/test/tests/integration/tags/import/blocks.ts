import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"import" tag and blocks';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import _self as macros %}
{% from _self import input %}

{% block foo %}
    {{- macros.input('username') }}
    {{- input('username') }}

    {%- import _self as lmacros %}
    {%- from _self import input as linput %}

    {{- lmacros.input('username') }}
    {{- linput('username') }}
{% endblock %}

{% block bar %}
    {{- macros.input('username') }}
    {{- input('username') }}
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
<input name="username">
<input name="username">
<input name="username">


<input name="username">
<input name="username">
`;
    }

}

runTest(createIntegrationTest(new Test));
