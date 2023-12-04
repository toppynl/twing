import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"filter" tag creates a new context scope';
    }

    getTemplates() {
        return {
            'index.twig': `
{% filter upper %}
    {% set item = "foo" %}
{% endfilter %}
{{ item }}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Variable "item" does not exist in "index.twig" at line 5, column 4.';
    }
}

runTest(createIntegrationTest(new Test));
