import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing supports the "matches" operator';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 'foo' matches '/o/' ? 'OK' : 'KO' }}
{{ 'foo' matches '/^fo/' ? 'OK' : 'KO' }}
{{ 'foo' matches '/O/i' ? 'OK' : 'KO' }}`
        };
    }

    getExpected() {
        return `
OK
OK
OK
`;
    }
}

runTest(createIntegrationTest(new Test));
