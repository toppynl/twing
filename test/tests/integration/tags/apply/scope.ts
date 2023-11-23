import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"apply" tag does not create a new scope';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set foo = 'baz' %}
{% apply spaceless %}
    {% set foo = 'foo' %}
    {% set bar = 'bar' %}
{% endapply %}
{{ 'foo' == foo ? 'OK ' ~ foo : 'KO' }}
{{ 'bar' == bar ? 'OK ' ~ bar : 'KO' }}
`
        };
    }

    getExpected() {
        return `
OK foo
OK bar
`;
    }

    getType(): "template" | "execution context" | undefined {
        return "execution context";
    }
}

runTest(createIntegrationTest(new Test));
