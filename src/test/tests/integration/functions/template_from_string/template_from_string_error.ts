import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"template_from_string" function error';
    }

    getTemplates() {
        return {
            'index.twig': `
{% include template_from_string("{{ not a Twig template ", "foo.twig") %}
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: Unclosed variable opened at {1:1} in "foo.twig" at line 1, column 24.'
    }
}

runTest(createIntegrationTest(new Test()));
runTest({
    description: '"template_from_string" function error with no name',
    templates: {
        'index.twig': `
{% include template_from_string("{{ not a Twig template ") %}`
    },
    expectedErrorMessage: 'TwingParsingError: Unclosed variable opened at {1:1} in "{{ not a Twig template " at line 1, column 24.'
});
