import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Exception for an undefined parent';
    }

    getTemplates() {
        return {
            'index.twig': `
{% extends 'foo.html' %}

{% set foo = "foo" %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Unable to find template "foo.html" in "index.twig" at line 2.';
    }
}

runTest(createIntegrationTest(new Test));
