import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"import" tag with a template as string';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import template_from_string("{% macro test() %}ok{% endmacro %}") as m %}
{{ m.test() }}
`
        };
    }

    getExpected() {
        return `
ok
`;
    }

}

runTest(createIntegrationTest(new Test));
