import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../main/lib/environment";

let Luxon = require('luxon');

class Test extends TestBase {
    getDescription() {
        return '"date" filter honors default interval format';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ date2|date }}
{{ date2|date('%d days') }}
`
        };
    }

    getExpected() {
        return `
2 days 0 hours
2 days`;
    }

    getContext() {
        return {
            date2: Luxon.Duration.fromObject({
                days: 2
            })
        };
    }
    
    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            dateFormat: 'Y-m-d',
            dateIntervalFormat: '%d days %h hours'
        };
    }
}

runTest(createIntegrationTest(new Test()));
