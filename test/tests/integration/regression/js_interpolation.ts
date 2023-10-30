import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Template can contain JS interpolation-like strings';
    }

    getTemplates() {
        return {
            'index.twig': `\${thisShouldBeHandledAsRawText}
{{ "\${thisShouldBeHandledAsRawText}" }}`
        };
    }

    getExpected() {
        return `\${thisShouldBeHandledAsRawText}
\${thisShouldBeHandledAsRawText}`;
    }
}

runTest(createIntegrationTest(new Test));
