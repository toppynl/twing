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
        return 'TwingErrorRuntime: Variable `item` does not exist in "index.twig" at line 5.';
    }
}

runTest(createIntegrationTest(new Test));
