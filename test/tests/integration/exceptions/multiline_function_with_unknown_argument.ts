import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Exception for multiline function with unknown argument';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ include('foo',
   with_context=True,
   invalid=False
) }}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingErrorSyntax: Unknown argument "invalid" for function "include(template, variables, with_context, ignore_missing, sandboxed)" in "index.twig" at line 4.';
    }
}

runTest(createIntegrationTest(new Test));
