import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../src/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"set" tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set foo = 'foo' %}
{% set bar = 'foo<br />' %}

{{ foo }}
{{ bar }}

{% set foo, bar = 'foo', 'bar' %}

{{ foo }}{{ bar }}`
        };
    }

    getExpected() {
        return `
foo
foo&lt;br /&gt;


foobar
`;
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            autoEscapingStrategy: "html"
        };
    }
}

runTest(createIntegrationTest(new Test));
