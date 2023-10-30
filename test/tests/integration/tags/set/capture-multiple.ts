import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"set" tag block multiple capture';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set foo %}
bar
{% endset %}
{% set bar %}
foo
{% endset %}

{{ foo }}
{{ bar }}
`
        };
    }

    getExpected() {
        return `
bar

foo
`;
    }

}

runTest(createIntegrationTest(new Test));
