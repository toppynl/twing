import {runTest} from "../../TestBase";

runTest({
   description: '"round" filter with an unsupported method',
   templates: {
       "index.twig": `{{ 5|round(0, "foo") }}`
   },
    expectedErrorMessage: 'TwingRuntimeError: The round filter only supports the "common", "ceil", and "floor" methods in "index.twig" at line 1, column 6.'
});
