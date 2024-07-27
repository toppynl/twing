import {runTest} from "../TestBase";

runTest({
    description: 'Comparison of something to a boolean',
    templates: {
        "index.twig": `
{{ false == true ? 1 : 0 }}
{{ false == false ? 1 : 0 }}
{{ false == null ? 1 : 0 }}
{{ false == "0" ? 1 : 0 }}
{{ false == "1" ? 1 : 0 }}
{{ false == "1.1" ? 1 : 0 }}
{{ false == "f" ? 1 : 0 }}
{{ false == "foo" ? 1 : 0 }}
{{ false == [] ? 1 : 0 }}
{{ false == ["foo"] ? 1 : 0 }}
{{ false == 0 ? 1 : 0 }}
{{ false == 5 ? 1 : 0 }}
{{ false == foo ? 1 : 0 }}
{{ true == true ? 1 : 0 }}
{{ true == false ? 1 : 0 }}
{{ true == null ? 1 : 0 }}
{{ true == "0" ? 1 : 0 }}
{{ true == "1" ? 1 : 0 }}
{{ true == "1.1" ? 1 : 0 }}
{{ true == "f" ? 1 : 0 }}
{{ true == "foo" ? 1 : 0 }}
{{ true == [] ? 1 : 0 }}
{{ true == ["foo"] ? 1 : 0 }}
{{ true == 0 ? 1 : 0 }}
{{ true == 5 ? 1 : 0 }}
{{ true == foo ? 1 : 0 }}
`
    },
    context: {
        foo: new (class{})
    },
    trimmedExpectation: `
0
1
1
1
0
0
0
0
1
0
1
0
0
1
0
0
0
1
1
1
1
0
1
0
1
1
`
});
