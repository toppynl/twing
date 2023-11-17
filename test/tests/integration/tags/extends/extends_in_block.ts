import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return 'inheritance: extends in block';
    }

    getTemplates() {
        return {
            'index.twig': `
{% block foo %}
    {% extends "foo.twig" %}
{% endblock %}
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: Cannot use "extend" in a block in "index.twig" at line 3, column 8.';
    }
}

runTest(createIntegrationTest(new Test));
