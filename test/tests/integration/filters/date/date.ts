import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../src/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"date" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set date1 = date("2010-10-04T13:45:00", "Europe/Paris") %}
{{ date1|date }}
{{ date1|date('d/m/Y') }}
{{ date1|date('d/m/Y H:i:s', 'Asia/Hong_Kong') }}
{{ date1|date('d/m/Y H:i:s P', 'Asia/Hong_Kong') }}
{{ date1|date('d/m/Y H:i:s P', 'America/Chicago') }}
{{ date1|date('e') }}
{{ date1|date('d/m/Y H:i:s') }}

{% set date2 = date("2010-10-04T13:45:00", "UTC") %}
{{ date2|date }}
{{ date2|date('d/m/Y') }}
{{ date2|date('d/m/Y H:i:s', 'Asia/Hong_Kong') }}
{{ date2|date('d/m/Y H:i:s', timezone1) }}
{{ date2|date('d/m/Y H:i:s') }}

{% set date3 = date("2010-10-04T13:45:00") %}
{{ date3|date }}
{{ date3|date('d/m/Y') }}

{% set date4 = date("1286199900") %}
{{ date4|date }}
{{ date4|date('d/m/Y') }}

{% set date5 = date("-189291360") %}
{{ date5|date }}
{{ date5|date('d/m/Y') }}

{% set date6 = date("2010-10-04T13:45:00", "America/New_York") %}
{{ date6|date('d/m/Y H:i:s P', 'Europe/Paris') }}
{{ date6|date('d/m/Y H:i:s P', 'Asia/Hong_Kong') }}
{{ date6|date('d/m/Y H:i:s P', false) }}
{{ date6|date('e', 'Europe/Paris') }}
{{ date6|date('e', false) }}

{% set date7 = date("2010-01-28T15:00:00+04:00") %}
{{ date7|date }}
{{ date7|date(timezone='Europe/Paris') }}
{{ date7|date(timezone='Asia/Hong_Kong') }}
{{ date7|date(timezone=false) }}
{{ date7|date(timezone='Indian/Mauritius') }}

{{ '2010-01-28 15:00:00'|date(timezone="Europe/Paris") }}
{{ '2010-01-28 15:00:00'|date(timezone="Asia/Hong_Kong") }}`
        };
    }

    getExpected() {
        return `
October 4, 2010 13:45
04/10/2010
04/10/2010 19:45:00
04/10/2010 19:45:00 +08:00
04/10/2010 06:45:00 -05:00
Europe/Paris
04/10/2010 13:45:00

October 4, 2010 13:45
04/10/2010
04/10/2010 19:45:00
04/10/2010 07:45:00
04/10/2010 13:45:00

October 4, 2010 13:45
04/10/2010

October 4, 2010 15:45
04/10/2010

January 2, 1964 04:04
02/01/1964

04/10/2010 13:45:00 +02:00
04/10/2010 19:45:00 +08:00
04/10/2010 07:45:00 -04:00
Europe/Paris
America/New_York

January 28, 2010 12:00
January 28, 2010 12:00
January 28, 2010 19:00
January 28, 2010 12:00
January 28, 2010 15:00

January 28, 2010 15:00
January 28, 2010 22:00
`;
    }
    
    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            timezone: 'Europe/Paris'
        };
    }

    getContext() {
        return {
            timezone1: 'America/New_York',
        }
    }
}

runTest(createIntegrationTest(new Test()));
