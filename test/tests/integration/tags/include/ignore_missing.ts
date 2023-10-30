import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" tag with ignore_missing';
    }

    getTemplates() {
        return {
            'index.twig': `
{% include ["foo.twig", "bar.twig"] ignore missing %}
{% include "foo.twig" ignore missing %}
{% include "foo.twig" ignore missing with {} %}
{% include "foo.twig" ignore missing with {} only %}`
        };
    }

    getExpected() {
        return `
`;
    }

}

runTest(createIntegrationTest(new Test));
