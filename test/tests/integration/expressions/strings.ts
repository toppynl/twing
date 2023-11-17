import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";
import {TwingEnvironmentOptions} from "../../../../src/lib/environment";

class Test extends TestBase {
    getDescription() {
        return 'Twing supports string interpolation';
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            autoEscapingStrategy: null
        };
    }

    getTemplates() {
        return {
            'index.twig': `
{{ "foo #{"foo #{bar} baz"} baz" }}
{{ "foo #{bar}#{bar} baz" }}
{% set var = 'value' %}
{{ "string \\"interpolation\\": '#{var}'" }}`
        };
    }

    getExpected() {
        return `
foo foo BAR baz baz
foo BARBAR baz
string "interpolation": 'value'
`;
    }

    getContext() {
        return {
            bar: 'BAR'
        }
    }
}

runTest(createIntegrationTest(new Test));
