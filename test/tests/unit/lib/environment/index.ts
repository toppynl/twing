import * as tape from "tape";
import {createEnvironment} from "../../../../../src/lib/environment";
import {createArrayLoader} from "../../../../../src/lib/loader/array";

// todo: unit test every property because this is the public API
tape('createEnvironment ', ({test}) => {
    test('render', ({test}) => {
        test('throws on not found template', ({same, fail, end}) => {
            const environment = createEnvironment(
                createArrayLoader({})
            );

            return environment.render('foo')
                .then(() => fail)
                .catch((error: any) => {
                    same((error as Error).name, 'TwingTemplateLoadingError');
                    same((error as Error).message, 'Unable to find template "foo".');
                })
                .finally(end);
        })
    });
});
