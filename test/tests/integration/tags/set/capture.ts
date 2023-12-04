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

{{ foo }}
{{ foo|escape }}`
        };
    }

    getExpected() {
        return `
f<br />o<br />o
f&lt;br /&gt;o&lt;br /&gt;o
`;
    }

}

runTest(createIntegrationTest(new Test));
