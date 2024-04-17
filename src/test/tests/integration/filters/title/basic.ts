import {runTest} from "../../TestBase";
import {createMarkup} from "../../../../../main/lib/markup";

runTest({
    description: '"title" filter',
    templates: {
        "index.twig": `
{{ "FoO"|title }}
{{ markup|title }}
`
    },
    trimmedExpectation: `
Foo
Foo
`,
    context: Promise.resolve({
        markup: createMarkup(('FoO'), "UTF-8")
    })
});
