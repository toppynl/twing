import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {createSandboxSecurityPolicy} from "../../../../../src/lib/sandbox/security-policy";

class Test extends TestBase {
    getDescription() {
        return '"include" tag sandboxed';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ include("foo.twig", sandboxed = true) }}`,
            'foo.twig': `
{{ foo|e }}
{{ foo|e }}`
        };
    }
    
    getContext(): any {
        return {
            foo: 'bar'
        };
    }

    getExpectedErrorMessage() {
        return 'TwingSandboxSecurityError: Filter "e" is not allowed in "foo.twig" at line 2, column 8.';
    }
}

runTest(createIntegrationTest(new Test()));

runTest({
    description: '"include" function sandboxed within a sandboxed runtime',
    templates: {
        "index.twig": `
{{ include("foo.twig", sandboxed = true) }}`,
        'foo.twig': `
{{ foo|e }}
{{ foo|e }}`
    },
    environmentOptions: {
        sandboxed: true,
        sandboxPolicy: createSandboxSecurityPolicy({
            allowedFunctions: ['include']
        })
    },
    expectedErrorMessage: 'TwingSandboxSecurityError: Filter "e" is not allowed in "foo.twig" at line 2, column 8.'
});
