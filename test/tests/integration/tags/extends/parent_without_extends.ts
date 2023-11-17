import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getTemplates() {
        return {
            'index.twig': `
{% block content %}
    {{ parent() }}
{% endblock %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: Calling "parent" on a template that does not extend nor "use" another template is forbidden in "index.twig" at line 3, column 8.';
    }
}

runTest(createIntegrationTest(new Test));
