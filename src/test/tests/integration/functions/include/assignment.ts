import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" function with assignment';
    }

    getTemplates() {
        return {
            'index.twig': `{% set tmp = include("foo.twig") %}FOO{{ tmp }}BAR`,
            'foo.twig': `foo.twig content`
        };
    }

    getExpected() {
        return `
FOOfoo.twig contentBAR
`;
    }
}

runTest(createIntegrationTest(new Test()));
