import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"for" tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% for i, item in items if i > 0 %}
    {{ loop.last }}
{% endfor %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: The "loop.last" variable is not defined when looping with a condition in "index.twig" at line 3.'
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
