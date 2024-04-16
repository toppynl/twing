import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"escape" filter with variable as strategy';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set strategy = "html" %}
{{ "foo <br />"|escape(strategy) }}`
        };
    }
    
    getExpected() {
        return `
foo &lt;br /&gt;
`;
    }
}

runTest(createIntegrationTest(new Test()));
