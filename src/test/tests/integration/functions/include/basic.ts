import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" function';
    }

    getTemplates() {
        return {
            'index.twig': `
FOO
{{ include("foo.twig") }}

BAR`,
            'foo.twig': `
FOOBAR`
        };
    }

    getExpected() {
        return `
FOO

FOOBAR

BAR
`;
    }
}

runTest(createIntegrationTest(new Test()));
