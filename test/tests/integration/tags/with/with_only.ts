import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"with" tag with expression and only';
    }

    getTemplates() {
        return {
            'index.twig': `
{% with {foo: 'foo', bar: 'BAZ'} only %}
    {{ foo }}{{ bar }}{{ baz }}
{% endwith %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Variable "baz" does not exist in "index.twig" at line 3, column 26.';
    }

    getContext() {
        return {
            foo: 'baz',
            baz: 'baz'
        }
    }
}

runTest(createIntegrationTest(new Test));
