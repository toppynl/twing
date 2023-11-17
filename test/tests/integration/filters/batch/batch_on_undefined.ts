import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

/**
 * @see https://github.com/NightlyCommit/twing/issues/236
 */
class Test extends TestBase {
    getDescription() {
        return '"batch" filter on undefined variable';
    }

    getTemplates() {
        return {
            'index.twig': `{% for item in items|batch(3) %}
{% endfor %}
`
        };
    }

    getEnvironmentOptions() {
        return {
            strictVariables: false
        };
    }

    getExpected() {
        return `
`;
    }

    getContext() {
        return {};
    }
}

runTest(createIntegrationTest(new Test()));
