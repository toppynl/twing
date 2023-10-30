import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"import" tag macro in a macro';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import _self as foo %}

{{ foo.foo() }}

{% macro foo() %}
    {{ foo.another() }}
{% endmacro %}

{% macro another() %}
    OK
{% endmacro %}
`
        };
    }

    getExpected() {
        return `
OK
`;
    }

}

runTest(createIntegrationTest(new Test));
