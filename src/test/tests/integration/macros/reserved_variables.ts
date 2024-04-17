import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'macro';
    }

    getTemplates() {
        return {
            'index.twig': `
{% from _self import test %}

{% macro test(this) -%}
    {{ this }}
{%- endmacro %}

{{ test(this) }}`
        };
    }

    getExpected() {
        return `
foo
`;
    }

    getContext() {
        return {
            'this': 'foo'
        }
    }
}

runTest(createIntegrationTest(new Test));
