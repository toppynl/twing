import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'macro with a filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import _self as test %}

{% macro test() %}
    {% filter escape %}foo<br />{% endfilter %}
{% endmacro %}

{{ test.test() }}`
        };
    }

    getExpected() {
        return `
foo&lt;br /&gt;
`;
    }
}

runTest(createIntegrationTest(new Test));
