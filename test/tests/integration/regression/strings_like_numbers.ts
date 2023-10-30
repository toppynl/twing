import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing does not confuse strings with integers in getAttribute()';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ hash['2e2'] }}`
        };
    }

    getExpected() {
        return `
works
`;
    }

    getContext() {
        return {
            hash: {'2e2': 'works'}
        }
    }
}

runTest(createIntegrationTest(new Test));
