import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"apply" tag applies json_encode on its children';
    }

    getTemplates() {
        return {
            'index.twig': `
{% apply json_encode|raw %}test{% endapply %}`
        };
    }

    getExpected() {
        return `
"test"
`;
    }

    getType(): "template" | "execution context" | undefined {
        return "execution context";
    }
}

runTest(createIntegrationTest(new Test));
