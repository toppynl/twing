import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing supports the ternary operator with no then directive';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 'YES' ?: 'NO' }}
{{ 0 ?: 'NO' }}`
        };
    }

    getExpected() {
        return `
YES
NO
`;
    }
}

runTest(createIntegrationTest(new Test));
