import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Exception for an undefined trait';
    }

    getTemplates() {
        return {
            'index.twig': `
{% use 'foo' with foobar as bar %}`,
            'foo': `
{% block bar %}
{% endblock %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Block `foobar` is not defined in trait `foo` in "index.twig" at line 2.';
    }
}

runTest(createIntegrationTest(new Test));
