import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"set" tag block empty capture';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set foo %}{% endset %}

{% if foo %}FAIL{% endif %}`
        };
    }

    getExpected() {
        return `
`;
    }

}

runTest(createIntegrationTest(new Test));
