import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"with" tag include the globals';
    }

    getTemplates() {
        return {
            'index.twig': `
{% with [] only %}
    {{ global }}
{% endwith %}
`
        };
    }

    getExpected() {
        return `
global
`;
    }

}

runTest(createIntegrationTest(new Test));
