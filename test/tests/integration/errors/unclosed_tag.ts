import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Exception for an unclosed tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% block foo %}
     {% if foo %}




         {% for i in fo %}



         {% endfor %}



{% endblock %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: Unexpected "endblock" tag (expecting closing tag for the "if" tag defined line 4) in "index.twig" at line 16, column 4.';
    }
}

runTest(createIntegrationTest(new Test));
