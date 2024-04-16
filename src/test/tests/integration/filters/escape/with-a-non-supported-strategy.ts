import {runTest} from "../../TestBase";

runTest({
   description: '"escape" filter with non a supported strategy',
   templates: {
       "index.twig": `{{ 5|escape("foo") }}`
   },
    expectedErrorMessage: 'TwingRuntimeError: Invalid escaping strategy "foo" (valid ones: css, custom, html, html_attr, js, url) in "index.twig" at line 1, column 6.'
});
