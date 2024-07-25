import {runTest} from "../TestBase";
import {stub} from "sinon";
import {createSource} from "../../../../main/lib/source";
import {resolve} from "path";
import {createArrayLoader} from "../../../../main/lib/loader/array";

const loader = createArrayLoader({});

stub(loader, "getSource").resolves(createSource(resolve('foo/bar'), '{% spaceless %} 5 {% endspaceless %}'));

runTest({
    description: '"spaceless" node source map',
    loader,
    context: Promise.resolve({}),
    expectedSourceMapMappings: [{
        source: 'foo/bar',
        generatedLine: 1,
        generatedColumn: 0,
        originalLine: 1,
        originalColumn: 15,
        name: 'text'
    }],
    trimmedExpectation: `5`
});
