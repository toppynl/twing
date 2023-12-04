import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'macro';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import _self as macros %}

{% macro foo(data) %}
    {{ data }}
{% endmacro %}

{% macro bar() %}
    <br />
{% endmacro %}

{{ macros.foo(macros.bar()) }}`
        };
    }

    getExpected() {
        return `
<br />
`;
    }
}

runTest(createIntegrationTest(new Test));
