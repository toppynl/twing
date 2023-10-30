import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";
import {TwingEnvironmentOptions} from "../../../../src/lib/environment";

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

    /**
     * Double-escape as expected
     * @see https://twig.symfony.com/doc/3.x/filters/escape.html
     */
    getExpected() {
        return `
foo &amp;lt;br /&amp;gt;
`;
    }
    
    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            escapingStrategy: "html"
        };
    }
}

runTest(createIntegrationTest(new Test()));
