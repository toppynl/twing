import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Exception for multiline tag with undefined variable';
    }

    getTemplates() {
        return {
            'index.twig': `
{% include 'foo'
   with vars
%}`,
            'foo': `
Foo`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Variable "vars" does not exist in "index.twig" at line 3, column 9.';
    }
}

runTest(createIntegrationTest(new Test));
