import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"verbatim" tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% verbatim %}
{{ foo }}
{% endverbatim %}`
        };
    }

    getExpected() {
        return `
{{ foo }}`;
    }

}

runTest(createIntegrationTest(new Test));
