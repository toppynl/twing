import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'The === strict comparison operator is not supported';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 1 === 2 }}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: Unexpected operator of value "=". Did you try to use "===" for strict comparison? Use "===" or "is same as(value)" in "index.twig" at line 2, column 8.';
    }
}

runTest(createIntegrationTest(new Test));
