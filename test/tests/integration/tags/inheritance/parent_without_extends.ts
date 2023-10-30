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
        return 'TwingErrorSyntax: Calling "parent" on a template that does not extend nor "use" another template is forbidden in "index.twig" at line 3.';
    }
}

runTest(createIntegrationTest(new Test));
