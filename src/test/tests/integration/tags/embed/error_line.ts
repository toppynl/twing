import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"embed" tag honors error line number';
    }

    getTemplates() {
        return {
            'foo.twig': `
{% block c1 %}{% endblock %}`,
            'index.twig': `
FOO
{% embed "foo.twig" %}
    {% block c1 %}
        {{ nothing }}
    {% endblock %}
{% endembed %}
BAR`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Variable "nothing" does not exist in "index.twig" at line 5, column 12.'
    }
}

runTest(createIntegrationTest(new Test));
