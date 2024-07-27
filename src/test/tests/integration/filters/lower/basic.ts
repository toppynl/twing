import {runTest} from "../../TestBase";
import {createMarkup} from "../../../../../main/lib/markup";

runTest({
    description: '"lower" filter',
    templates: {
        "index.twig": `
{{ "FoO"|lower }}
{{ markup|lower }}
`
    },
    trimmedExpectation: `
foo
foo
`,
    context: {
        markup: createMarkup(('FoO'), "UTF-8")
    }
});
