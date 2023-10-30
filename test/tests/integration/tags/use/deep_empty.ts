import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"use" tag';
    }

    getTemplates() {
        return {
            'bar.twig': `
`,
            'foo.twig': `
{% use "bar.twig" %}`,
            'index.twig': `
{% use "foo.twig" %}`
        };
    }

    getExpected() {
        return `
`;
    }

}

runTest(createIntegrationTest(new Test));
