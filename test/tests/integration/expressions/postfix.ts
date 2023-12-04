import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing parses postfix expressions';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import _self as macros %}

{% macro foo() %}foo{% endmacro %}

{{ 'a' }}
{{ 'a'|upper }}
{{ ('a')|upper }}
{{ -1|upper }}
{{ macros.foo() }}
{{ (macros).foo() }}`
        };
    }

    getExpected() {
        return `
a
A
A
-1
foo
foo
`;
    }
}

runTest(createIntegrationTest(new Test));
