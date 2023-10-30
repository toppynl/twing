import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"macro" tag supports name for endmacro';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import _self as macros %}

{{ macros.foo() }}
{{ macros.bar() }}

{% macro foo() %}foo{% endmacro %}
{% macro bar() %}bar{% endmacro bar %}`
        };
    }

    getExpected() {
        return `
foo
bar

`;
    }
}

runTest(createIntegrationTest(new Test));
