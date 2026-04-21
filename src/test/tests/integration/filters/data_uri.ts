import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"data_uri" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 'hello'|data_uri('text/plain') }}
{{ 'hi'|data_uri }}
`
        };
    }

    getExpected() {
        return `
data:text/plain;base64,aGVsbG8=
data:text/plain;base64,aGk=
`;
    }
}

runTest(createIntegrationTest(new Test()));
