import {runTest} from "../../TestBase";
import {createMarkup} from "../../../../../main/lib/markup";

runTest({
    description: '"escape" filter with a markup and autoescape',
    templates: {
        "index.twig": '{% autoescape %}{{ foo|escape("html") }}{% endautoescape %}'
    },
    expectation: '<br/>',
    context: {
        foo: createMarkup('<br/>', "UTF-8")
    }
});
