import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'macro with arbitrary arguments';
    }

    getTemplates() {
        return {
            'index.twig': `
{% from _self import test1, test2 %}

{% macro test1(var) %}
    {{- var }}: {{ varargs|join(", ") }}
{% endmacro %}

{% macro test2() %}
    {{- varargs|join(", ") }}
{% endmacro %}

{{ test1("foo", "bar", "foobar") }}
{{ test2("foo", "bar", "foobar") }}`
        };
    }

    getExpected() {
        return `
foo: bar, foobar

foo, bar, foobar`;
    }
}

runTest(createIntegrationTest(new Test));
