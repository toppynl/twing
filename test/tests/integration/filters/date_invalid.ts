import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

let Luxon = require('luxon');

class Test extends TestBase {
    getName() {
        return 'filters/date_invalid';
    }

    getDescription() {
        return '"date" filter with invalid date';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ date1|date }}
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Failed to parse date "2010 -01-28T15:00:00+04:00" in "index.twig" at line 2.';
    }

    getContext() {
        Luxon.Settings.defaultZoneName = 'Europe/Paris';

        return {
            date1: '2010 -01-28T15:00:00+04:00'
        }
    }
}

runTest(createIntegrationTest(new Test()));
