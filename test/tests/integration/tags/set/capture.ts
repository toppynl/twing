import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"set" tag block capture';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set foo %}f<br />o<br />o{% endset %}

{{ foo }}`
        };
    }

    getExpected() {
        return `
f<br />o<br />o
`;
    }

}

runTest(createIntegrationTest(new Test));
