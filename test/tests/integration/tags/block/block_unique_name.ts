import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
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
        return 'TwingParsingError: The block \'content\' has already been defined line 2 in "index.twig" at line 3.';
    }
}

runTest(createIntegrationTest(new Test));
