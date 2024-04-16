import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" function is safe for auto-escaping';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ include("foo.twig") }}`,
            'foo.twig': `
<p>Test</p>`
        };
    }

    getExpected() {
        return `
<p>Test</p>
`;
    }
}

runTest(createIntegrationTest(new Test()));
