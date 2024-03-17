import * as tape from "tape";
import {createEnvironment} from "../../../../../src/lib/environment";
import {createArrayLoader} from "../../../../../src/lib/loader/array";
import {Settings} from "luxon";

// todo: unit test every property because this is the public API
import "./loader";

tape('createEnvironment ', ({test}) => {
    test('options', ({test}) => {
        test('apply default values', ({same, end}) => {
            Settings.defaultZoneName = "Europe/Paris";

            const environment = createEnvironment(createArrayLoader({}));

            same(environment.charset, 'UTF-8');
            same(environment.dateFormat, 'F j, Y H:i');
            same(environment.numberFormat, {
                decimalPoint: '.',
                numberOfDecimals: 0,
                thousandSeparator: ','
            });
            same(environment.timezone, 'Europe/Paris');

            end();
        });
    });

    test('render', ({test}) => {
        test('throws on not found template', ({same, fail, end}) => {
            const environment = createEnvironment(
                createArrayLoader({})
            );

            return environment.render('foo', {})
                .then(() => fail)
                .catch((error: any) => {
                    same((error as Error).name, 'TwingTemplateLoadingError');
                    same((error as Error).message, 'Unable to find template "foo".');
                })
                .finally(end);
        })
    });
});
