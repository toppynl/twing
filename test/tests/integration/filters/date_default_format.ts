import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";
import {TwingEnvironmentOptions} from "../../../../src/lib/environment";

let Luxon = require('luxon');

class Test extends TestBase {
    getDescription() {
        return '"date" filter honors default date format';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ date1|date }}
{{ date1|date('d/m/Y') }}`
        };
    }

    getExpected() {
        return `
2010-10-04
04/10/2010`;
    }

    getContext() {
        Luxon.Settings.defaultZoneName = 'UTC';
        
        return {
            date1: new Date(2010, 9, 4, 13, 45, 0)
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
