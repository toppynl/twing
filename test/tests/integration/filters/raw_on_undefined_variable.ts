import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";
import {TwingEnvironmentOptions} from "../../../../src/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"raw" filter on undefined variable';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ foo|raw }}
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

export default Test;

runTest(createIntegrationTest(new Test()));
