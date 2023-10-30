import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" tag';
    }

    getTemplates() {
        return {
            'foo.twig': `
FOOBAR`,
            'index.twig': `
FOO
{% include "foo.twig" %}

BAR`
        };
    }

    getExpected() {
        return `
FOO

FOOBAR
BAR`;
    }

}

runTest(createIntegrationTest(new Test));
