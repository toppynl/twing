import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"macro" tag with default values';
    }

    getTemplates() {
        return {
            'index.twig': `
{% from _self import test %}

{% macro test(a, b = 'bar') -%}
{{ a }}{{ b }}
{%- endmacro %}

{{ test('foo') }}
{{ test('bar', 'foo') }}`
        };
    }

    getExpected() {
        return `
foobar
barfoo
`;
    }
}

runTest(createIntegrationTest(new Test));
