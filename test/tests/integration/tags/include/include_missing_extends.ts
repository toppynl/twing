import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" tag with ignore_missing and missing extends in included template';
    }

    getTemplates() {
        return {
            'bad.twig': `
{% extends 'DOES NOT EXIST' %}
`,
            'good.twig': `
NOT DISPLAYED
`,
            'index.twig': `
{% include ['bad.twig', 'good.twig'] ignore missing %}
NOT DISPLAYED
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Unable to find template "DOES NOT EXIST" in "bad.twig" at line 2.';
    }
}

runTest(createIntegrationTest(new Test));
