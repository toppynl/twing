import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" function with missing template';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ include("foo.twig") }}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Template "foo.twig" is not defined in "index.twig" at line 2.';
    }
}

runTest(createIntegrationTest(new Test()));
