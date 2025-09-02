import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"date" function';
    }

    getTemplates() {
        return {
            'index.twig': `{# see https://github.com/twigphp/Twig/issues/2667 #}
{% set date = date("2010-10-04T13:45:00") %}
{% set date1 = date("2010-10-04T13:45:00") %}
{% set date2 = date("2010-10-04T13:45:00") %}
{% set date3 = "2010-10-04 13:45" %}
{% set date4 = 1286199900 %}
{% set date5 = -189291360 %}
{{ date()|date('r') == date('now')|date('r') ? 'OK' : 'KO' }}
{{ date(date1) == date('2010-10-04 13:45') ? 'OK' : 'KO' }}
{{ date(date2) == date('2010-10-04 13:45') ? 'OK' : 'KO' }}
{{ date(date3) == date('2010-10-04 13:45') ? 'OK' : 'KO' }}
{{ date(date4) == date('2010-10-04 15:45') ? 'OK' : 'KO' }}
{{ date(date5) == date('1964-01-02 04:04') ? 'OK' : 'KO' }}
{{ date() > date('-1day') ? 'OK' : 'KO' }}
{{ date(date, "America/New_York")|date('d/m/Y H:i:s P', false) }}
{# named arguments with equals #}
{{ date(timezone="America/New_York", date=date)|date('d/m/Y H:i:s P', false) }}
{# named arguments with colon #}
{{ date(timezone="America/New_York", date: date)|date('d/m/Y H:i:s P', false) }}`
        };
    }

    getExpected() {
        return `
OK
OK
OK
OK
OK
OK
OK
04/10/2010 07:45:00 -04:00
04/10/2010 07:45:00 -04:00
04/10/2010 07:45:00 -04:00
`;
    }
}

runTest(createIntegrationTest(new Test));
