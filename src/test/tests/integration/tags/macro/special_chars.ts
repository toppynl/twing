import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"§" as a macro name';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import _self as macros %}

{{ macros.§('foo') }}

{% macro §(foo) %}
  §{{ foo }}§
{% endmacro %}`
        };
    }

    getExpected() {
        return `
§foo§
`;
    }
}

runTest(createIntegrationTest(new Test));
