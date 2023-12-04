import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"date" filter supports named arguments';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set date=date('2010-10-04T13:45:00', "UTC") %}
{{ date|date(format='d/m/Y H:i:s P', timezone='America/Chicago') }}
{{ date|date(timezone='America/Chicago', format='d/m/Y H:i:s P') }}
{{ date|date('d/m/Y H:i:s P', timezone='America/Chicago') }}`
        };
    }

    getExpected() {
        return `
04/10/2010 06:45:00 -05:00
04/10/2010 06:45:00 -05:00
04/10/2010 06:45:00 -05:00
`;
    }
}

runTest(createIntegrationTest(new Test()));
