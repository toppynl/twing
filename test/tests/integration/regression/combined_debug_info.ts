import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Exception with bad line number';
    }

    getTemplates() {
        return {
            'index.twig': `
{% block content %}
    {{ foo }}
    {{ include("foo") }}
{% endblock %}
index`,
            'foo': `
foo
{{ foo.bar }}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Impossible to access an attribute ("bar") on a string variable ("foo") in "foo" at line 3, column 4.';
    }

    getContext() {
        return {
            foo: 'foo'
        }
    }
}

runTest(createIntegrationTest(new Test));
