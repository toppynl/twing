import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

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
        return 'TwingSandboxSecurityError: Filter "e" is not allowed in "foo.twig" at line 4.';
    }
}

runTest(createIntegrationTest(new Test()));
