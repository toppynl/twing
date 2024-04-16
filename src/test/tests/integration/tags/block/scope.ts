import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"block" tag creates a new context scope';
    }

    getTemplates() {
        return {
            'index.twig': `
{% block foo %}
    {% set item = "bar" %}
{% endblock %}
{{ item }}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Variable "item" does not exist in "index.twig" at line 5, column 4.';
    }
}

runTest(createIntegrationTest(new Test));
