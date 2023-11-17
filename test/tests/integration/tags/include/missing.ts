import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" tag with missing template';
    }

    getTemplates() {
        return {
            'index.twig': `{% include "foo.twig" %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Unable to find template "foo.twig" in "index.twig" at line 1.';
    }
}

runTest(createIntegrationTest(new Test));
