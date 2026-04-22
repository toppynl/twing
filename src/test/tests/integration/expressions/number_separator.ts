import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing supports _ as a digit separator in number literals (Twig 3.17+)';
    }

    getTemplates() {
        return {
            'index.twig': `{{ 1_000 }}
{{ 1_000_000 }}
{{ 3.141_592 }}
{{ 1_000 + 2_000 }}`
        };
    }

    getExpected() {
        return `1000
1000000
3.141592
3000
`;
    }
}

runTest(createIntegrationTest(new Test));
