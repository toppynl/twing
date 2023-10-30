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
        return 'TwingErrorRuntime: Variable `vars` does not exist in "index.twig" at line 3.';
    }
}

runTest(createIntegrationTest(new Test));
