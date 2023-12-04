import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"§" special chars in a block name';
    }

    getTemplates() {
        return {
            'index.twig': `
{% block § %}
§
{% endblock § %}`
        };
    }

    getExpected() {
        return `
§`;
    }

}

runTest(createIntegrationTest(new Test));
