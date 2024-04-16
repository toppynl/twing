import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getTemplates() {
        return {
            'foo.twig': `
foo`,
            'index.twig': `
{% include ["foo.twig", "bar.twig"] %}
{% include ["bar.twig", "foo.twig"] %}`
        };
    }

    getExpected() {
        return `
foo
foo
`;
    }

}

runTest(createIntegrationTest(new Test));
