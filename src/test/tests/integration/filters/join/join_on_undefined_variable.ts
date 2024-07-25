import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

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

    getStrict(): boolean {
        return false;
    }
}

runTest(createIntegrationTest(new Test()));
