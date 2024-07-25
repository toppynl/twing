import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"autoescape" tag does not escape when raw is used as a filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set var = "<br/>" %}
{% autoescape 'html' %}
{{ var|raw }}
{% endautoescape %}`
        };
    }

    getExpected() {
        return `
<br/>
`;
    }
}

runTest(createIntegrationTest(new Test));
