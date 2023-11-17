import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../src/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"date" filter does not change the value of the operand';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set date1 = date("2010-10-04T13:45:00", "Europe/Paris") %}
{% set date2 = date("2010-10-04T13:45:00", "America/New_York") %}
{{ date1|date }}
{{ date1|date('d/m/Y') }}
{{ date1|date('d/m/Y H:i:s', 'Asia/Hong_Kong') }}
{{ date1|date('d/m/Y H:i:s', timezone1) }}
{{ date1|date('d/m/Y H:i:s') }}
{{ date1|date_modify('+1 hour')|date('d/m/Y H:i:s') }}

{{ date2|date('d/m/Y H:i:s P', 'Europe/Paris') }}
{{ date2|date('d/m/Y H:i:s P', 'Asia/Hong_Kong') }}
{{ date2|date('d/m/Y H:i:s P', false) }}
{{ date2|date('e', 'Europe/Paris') }}
{{ date2|date('e', false) }}
`
        };
    }

    getExpected() {
        return `
October 4, 2010 13:45
04/10/2010
04/10/2010 19:45:00
04/10/2010 07:45:00
04/10/2010 13:45:00
04/10/2010 14:45:00

04/10/2010 13:45:00 +02:00
04/10/2010 19:45:00 +08:00
04/10/2010 07:45:00 -04:00
Europe/Paris
America/New_York
`;
    }

    getContext() {
        return {
            timezone1: 'America/New_York',
        }
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            timezone: 'Europe/Paris'
        };
    }
}

runTest(createIntegrationTest(new Test()));
