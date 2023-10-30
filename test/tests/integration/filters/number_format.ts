import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"number_format" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 20|number_format }}
{{ 20.25|number_format }}
{{ 20.25|number_format(2) }}
{{ 20.25|number_format(2, ',') }}
{{ 1020.25|number_format(2, ',') }}
{{ 1020.25|number_format(2, ',', '.') }}`
        };
    }

    getExpected() {
        return `
20
20
20.25
20,25
1,020,25
1.020,25
`;
    }
}

runTest(createIntegrationTest(new Test()));
