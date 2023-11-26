import {runTest} from "../../TestBase";
import {createMarkup} from "../../../../../src/lib/markup";

runTest({
    description: '"striptags" filter',
    templates: {
        "index.twig": `
{{ "<div>content</div>"|striptags }}
{{ "<div>content</div>"|striptags("<div>") }}
{{ "<a><div><span>content</span></div></a>"|striptags("<div><span>") }}
`
    },
    trimmedExpectation: `
content
<div>content</div>
<div><span>content</span></div>
`,
    context: Promise.resolve({
        markup: createMarkup(('FoO'), "UTF-8")
    })
});
