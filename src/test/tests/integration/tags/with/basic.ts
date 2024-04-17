import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"with" tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% with %}
    {% set bar = 'BAZ' %}
    {{ foo }}{{ bar }}
{% endwith %}
{{ foo }}{{ bar }}`
        };
    }

    getExpected() {
        return `
fooBAZ
foobar
`;
    }


    getContext() {
        return {
            foo: 'foo',
            bar: 'bar'
        }
    }
}

runTest(createIntegrationTest(new Test));
