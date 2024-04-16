import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"set" tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set foo, bar = 'foo' ~ 'bar', 'bar' ~ 'foo' %}

{{ foo }}
{{ bar }}`
        };
    }

    getExpected() {
        return `
foobar
barfoo
`;
    }

}

runTest(createIntegrationTest(new Test));
