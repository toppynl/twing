import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"import" tag with same name in parent and child';
    }

    getTemplates() {
        return {
            'index.twig': `
{% extends "parent" %}

{% macro anotherThing() -%}
    Do it too
{% endmacro %}

{% import _self as macros %}
{% block content %}
    {{ parent() }}
    {{ macros.anotherThing() }}
{% endblock %}
`,
            'parent': `
{% macro thing() %}
    Do it
{% endmacro %}

{% import _self as macros %}
{% block content %}
    {{ macros.thing() }}
{% endblock %}
`
        };
    }

    getExpected() {
        return `
Do it


    Do it too
`;
    }

}

runTest(createIntegrationTest(new Test));
