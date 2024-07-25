import {runTest} from "../../TestBase";

runTest({
    description: '"defined" test for _self',
    templates: {
        'index.twig': '{% if _self is defined %}ok{% endif %}'
    },
    trimmedExpectation: 'ok'
});
