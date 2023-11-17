import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../src/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"join" filter on undefined variable';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ foo|join(', ') }}
`
        };
    }

    getExpected() {
        return `
`;
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            strictVariables: false
        };
    }
}

runTest(createIntegrationTest(new Test()));
