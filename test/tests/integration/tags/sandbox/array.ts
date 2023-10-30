import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../src/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"sandbox" tag support array';
    }

    getTemplates() {
        return {
            'foo.twig': `
{{ [a][0] }}
{{ dump([a][0]) }}
`,
            'index.twig': `
{%- sandbox %}
    {%- include "foo.twig" %}
{%- endsandbox %}
`
        };
    }

    getExpected() {
        return `
b
string(1) "b"
`;
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            escapingStrategy: false
        }
    }

    getContext() {
        return {
            'a': 'b'
        };
    }

    getSandboxSecurityPolicyFunctions() {
        return ['dump'];
    }
}

runTest(createIntegrationTest(new Test));
