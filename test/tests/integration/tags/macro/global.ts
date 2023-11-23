import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"macro" tag with global';
    }

    getTemplates() {
        return {
            'index.twig': `
{% from 'forms.twig' import foo %}

{{ foo('foo') }}
{{ foo() }}`,
            'forms.twig': `
{% macro foo(name) %}{{ name|default('foo') }}{{ global }}{% endmacro %}`
        };
    }

    getExpected() {
        return `
fooglobal
fooglobal
`;
    }
}

runTest(createIntegrationTest(new Test));
