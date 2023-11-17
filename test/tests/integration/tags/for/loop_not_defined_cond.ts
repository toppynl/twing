import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"for" tag with "loop" variable used in condition';
    }

    getTemplates() {
        return {
            'index.twig': `
{% for i, item in items if loop.last > 0 %}
{% endfor %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: The "loop" variable cannot be used in a looping condition in "index.twig" at line 2, column 28.'
    }

    getContext() {
        return {
            items: [
                'a',
                'b'
            ]
        };
    }
}

runTest(createIntegrationTest(new Test));
