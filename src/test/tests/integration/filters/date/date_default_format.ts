import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions, TwingSynchronousEnvironmentOptions} from "../../../../../main/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"date" filter honors default date format';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set date1 = date("2010-09-04T13:45:00") %}
{{ date1|date }}
{{ date1|date('d/m/Y') }}
`
        };
    }

    getExpected() {
        return `
2010-09-04
04/09/2010
`;
    }
    
    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            dateFormat: 'Y-m-d',
            dateIntervalFormat: '%d days %h hours'
        };
    }

    getSynchronousEnvironmentOptions(): TwingSynchronousEnvironmentOptions {
        return {
            dateFormat: 'Y-m-d',
            dateIntervalFormat: '%d days %h hours'
        };
    }
}

runTest(createIntegrationTest(new Test()));
