import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../src/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"sandbox" tag with non-allowed filter';
    }

    getTemplates() {
        return {
            'foo.twig': `{{ "foo"|upper }}`,
            'index.twig': `
{%- sandbox %}
    {%- include "foo.twig" %}
{%- endsandbox %}
`
        };
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            autoEscapingStrategy: "html"
        }
    }

    getExpectedErrorMessage() {
        return 'TwingSandboxSecurityError: Filter "upper" is not allowed in "foo.twig" at line 1.';
    }
}

runTest(createIntegrationTest(new Test));
