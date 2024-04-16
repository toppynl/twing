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
        return 'TwingParsingError: Unclosed variable opened at {1:1} in "foo.twig (string template 4900163d56b1af4b704c6b0afee7f98ba53418ce7a93d37a3af1882735baf9cd)" at line 1, column 24.'
    }
}

runTest(createIntegrationTest(new Test()));
