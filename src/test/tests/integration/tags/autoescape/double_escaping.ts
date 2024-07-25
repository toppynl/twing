import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"autoescape" tag does not double-escape';
    }

    getTemplates() {
        return {
            'index.twig': `
{% autoescape 'html' %}
{{ var|escape }}
{% endautoescape %}`
        };
    }

    getExpected() {
        return `
&lt;br /&gt;
`;
    }


    getContext() {
        return {
            'var': '<br />'
        };
    }
}

runTest(createIntegrationTest(new Test));
