import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"escape" filter with "js" as strategy';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ "é ♜ 𝌆"|e('js') }}
`
        };
    }

    getExpected() {
        return `
\\u00E9\\u0020\\u265C\\u0020\\uD834\\uDF06
`;
    }
}

runTest(createIntegrationTest(new Test()));
