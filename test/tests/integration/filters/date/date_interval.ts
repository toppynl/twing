import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

let Luxon = require('luxon');

class Test extends TestBase {
    getDescription() {
        return '"date" filter supports interval format';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ date1|date }}
{{ date1|date('%d days %h hours') }}
{{ date1|date('%d days %h hours', timezone1) }}`
        };
    }

    getExpected() {
        return `
2 days
2 days 0 hours
2 days 0 hours
`;
    }

    getContext() {
        return {
            date1: Luxon.Duration.fromObject({
                days: 2
            }),
            // This should have no effect on DateInterval formatting
            'timezone1': 'America/New_York'
        };
    }
}

runTest(createIntegrationTest(new Test()));
