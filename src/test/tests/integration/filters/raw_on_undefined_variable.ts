import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

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

    getStrict(): boolean {
        return false;
    }
}

export default Test;

runTest(createIntegrationTest(new Test()));
