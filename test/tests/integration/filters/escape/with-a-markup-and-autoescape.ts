import {runTest} from "../../TestBase";
import {createMarkup} from "../../../../../src/lib/markup";

runTest({
    description: '"escape" filter with a markup asn autoescape enabled',
    templates: {
        "index.twig": '{% autoescape %}{{ foo|escape("html") }}{% endautoescape %}'
    },
    trimmedExpectation: '&lt;br/&gt;',
    context: Promise.resolve({
        foo: createMarkup(('<br/>'), "UTF-8")
    })
});
