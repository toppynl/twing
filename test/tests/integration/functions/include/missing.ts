import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" function with missing template';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ include("foo") }}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Unable to find template "foo" in "index.twig" at line 2, column 4.';
    }
}

runTest(createIntegrationTest(new Test()));

runTest({
   description: '"include" function with multiple missing templates',
    templates: {
       "index.twig": '{{ include(["foo", null, "bar"]) }}'
    },
    expectedErrorMessage: 'TwingRuntimeError: Unable to find one of the following templates: "foo", "", "bar" in "index.twig" at line 1, column 4.'
});
