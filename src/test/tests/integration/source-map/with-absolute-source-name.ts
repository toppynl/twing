import {runTest} from "../TestBase";
import {stub} from "sinon";
import {createSource} from "../../../../main/lib/source";
import {resolve} from "path";
import {createArrayLoader, createSynchronousArrayLoader} from "../../../../main/lib/loader/array";

const loader = createArrayLoader({});
const synchronousLoader = createSynchronousArrayLoader({});

const source = createSource(resolve('foo/bar'), '{% spaceless %} 5 {% endspaceless %}');

stub(loader, "getSource").resolves(source);
stub(synchronousLoader, "getSource").returns(source);

runTest({
    description: '"spaceless" node source map',
    loader,
    synchronousLoader,
    context: {},
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
