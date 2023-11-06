import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" function with ignore_missing and missing extends in included template';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ include(['bad.twig', 'good.twig'], ignore_missing = true) }}
NOT DISPLAYED
`,
            'good.twig': `
NOT DISPLAYED
`,
            'bad.twig': `
{% extends 'DOES NOT EXIST' %}
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Template "DOES NOT EXIST" is not defined in "bad.twig" at line 2.';
    }
}

runTest(createIntegrationTest(new Test()));
