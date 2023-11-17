import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

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
{% set date1 = date("2010 -01-28T15:00:00+04:00") %}
{{ date1|date }}
`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Failed to parse date "2010 -01-28T15:00:00+04:00" in "index.twig" at line 2.';
    }
}

runTest(createIntegrationTest(new Test()));
