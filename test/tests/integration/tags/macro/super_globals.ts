import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return 'Super globals as macro arguments';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import _self as macros %}

{{ macros.foo('foo') }}

{% macro foo(GET) %}
    {{ GET }}
{% endmacro %}`
        };
    }

    getExpected() {
        return `
foo
`;
    }
}

runTest(createIntegrationTest(new Test));
