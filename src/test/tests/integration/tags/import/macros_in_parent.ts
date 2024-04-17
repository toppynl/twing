import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"import" tag macros in parent';
    }

    getTemplates() {
        return {
            'index.twig': `
{% import "macros" as m %}

{{ m.hello() }}
`,
            'macros': `
{% extends "parent" %}
`,
            'parent': `
{% macro hello() %}
    Test
{% endmacro %}
`
        };
    }

    getExpected() {
        return `
Test
`;
    }

}

runTest(createIntegrationTest(new Test));
