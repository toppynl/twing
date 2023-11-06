import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"from" tag with syntax error';
    }

    getTemplates() {
        return {
            'index.twig': `
{% from 'forms.twig' %}
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: Unexpected token "end of statement block" of value "%}\n" ("name" expected with value "import") in "index.twig" at line 2.';
    }
}

runTest(createIntegrationTest(new Test));
