import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

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
