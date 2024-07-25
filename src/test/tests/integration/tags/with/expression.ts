import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"with" tag with expression';
    }

    getTemplates() {
        return {
            'index.twig': `
{% with {foo: 'foo', bar: 'BAZ'} %}
    {{ foo }}{{ bar }}
{% endwith %}`
        };
    }

    getExpected() {
        return `
fooBAZ
`;
    }


    getContext() {
        return {
            foo: 'baz'
        }
    }
}

runTest(createIntegrationTest(new Test));
