import {runTest} from "../TestBase";
import {stub} from "sinon";
import {createSource} from "../../../../src/lib/source";
import {resolve} from "path";
import {createArrayLoader} from "../../../../src/lib/loader/array";

const loader = createArrayLoader({});

stub(loader, "getSourceContext").resolves(createSource('{% spaceless %} 5 {% endspaceless %}', resolve('foo/bar')));

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
    expectation: `5`
});
