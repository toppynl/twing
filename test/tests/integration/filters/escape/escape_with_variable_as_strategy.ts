import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../src/lib/environment";

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
    
    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            autoEscapingStrategy: "html"
        };
    }
}

runTest(createIntegrationTest(new Test()));
