import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription(): string {
        return 'An error is thrown when a block name is not unique';
    }

    getTemplates() {
        return {
            'index.twig': `
{% block content %}
    {% block content %}
    {% endblock %}
{% endblock %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: The block \'content\' has already been defined at {2:4} in "index.twig" at line 3, column 8.';
    }
}

runTest(createIntegrationTest(new Test));
