import * as tape from "tape";
import {createBaseError} from "../../../../../../main/lib/error/base";

tape('createBaseError', ({test}) => {
    test('creates a valid TwingBaseError', ({same, end}) => {
        const previousError = 'I am Error';
        const error = createBaseError('name', 'message', {
            column: 5,
            line: 6
        }, {
            code: 'code',
            name: 'name'
        }, previousError);

        same(error.previous, previousError);
        same(error.rootMessage, 'message');
        same(error.location.column, 5);
        same(error.location.line, 6);
        same(error.source.code, 'code');
        same(error.source.name, 'name');

        end();
    })
});
