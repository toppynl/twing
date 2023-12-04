import {runTest} from "../../TestBase";
import {createMarkup} from "../../../../../src/lib/markup";

runTest({
    description: '"escape" filter with a markup and autoescape',
    templates: {
        "index.twig": '{% autoescape %}{{ foo|escape("html") }}{% endautoescape %}'
    },
    expectation: '<br/>',
    context: Promise.resolve({
        foo: createMarkup('<br/>', "UTF-8")
    })
});
