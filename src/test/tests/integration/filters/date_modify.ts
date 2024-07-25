import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"date_modify" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set date1=date("2010-10-04 13:45", "UTC") %}
{{ date1|date_modify('-1day')|date('Y-m-d H:i:s') }}
{% set date2=date("2010-10-04T13:45", "UTC") %}
{{ date2|date_modify('-1day')|date('Y-m-d H:i:s') }}`
        };
    }

    getExpected() {
        return `
2010-10-03 13:45:00
2010-10-03 13:45:00`;
    }
}

runTest(createIntegrationTest(new Test()));
