import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return 'multiple *extends* tags';
    }

    getTemplates() {
        return {
            'index.twig': `
{% extends foo %}
{% extends bar %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: Multiple extends tags are forbidden in "index.twig" at line 3.';
    }
}

runTest(createIntegrationTest(new Test));
