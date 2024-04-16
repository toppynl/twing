import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"macro" auto-import without blocks';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import 'macros' as macro %}
{{ macro.foo() }}
`,
            'macros': `
{% macro foo() %}
    foo
    {{- _self.bar() }}
{% endmacro %}

{% macro bar() -%}
    bar
{% endmacro %}
`
        };
    }

    getExpected() {
        return `
foobar
`;
    }
}

runTest(createIntegrationTest(new Test));
