import {runTest} from "../../TestBase";
import {createMarkup} from "../../../../../main/lib/markup";

runTest({
    description: '"upper" filter',
    templates: {
        "index.twig": `
{{ "FoO"|upper }}
{{ markup|upper }}
`
    },
    trimmedExpectation: `
FOO
FOO
`,
    context: Promise.resolve({
        markup: createMarkup(('FoO'), "UTF-8")
    })
});
