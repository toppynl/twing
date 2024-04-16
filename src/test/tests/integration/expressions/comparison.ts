import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing supports comparison operators (==, !=, <, >, >=, <=)';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 1 > 2 }}/{{ 1 > 1 }}/{{ 1 >= 2 }}/{{ 1 >= 1 }}
{{ 1 < 2 }}/{{ 1 < 1 }}/{{ 1 <= 2 }}/{{ 1 <= 1 }}
{{ 1 == 1 }}/{{ 1 == 2 }}
{{ 1 != 1 }}/{{ 1 != 2 }}`
        };
    }

    getExpected() {
        return `
///1
1//1/1
1/
/1
`;
    }
}

runTest(createIntegrationTest(new Test));
