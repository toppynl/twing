import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Exception for an unknown tag syntax error';
    }

    getTemplates() {
        return {
            'index.twig': `{% includes "foo.twig" %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: Unknown "includes" tag. Did you mean "include" in "index.twig" at line 1, column 4?';
    }
}

runTest(createIntegrationTest(new Test));
