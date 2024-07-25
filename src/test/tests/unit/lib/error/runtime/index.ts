import * as tape from "tape";
import {createRuntimeError} from "../../../../../../main/lib/error/runtime";

tape('createRuntimeError', ({test}) => {
    test('creates a valid TwingRuntimeError', ({same, end}) => {
        const error = createRuntimeError('foo', {
            column: 5,
            line: 6
        }, {
            code: 'code',
            name: 'name'
        });

        same(error.location.column, 5);
        same(error.location.line, 6);
        same(error.source.code, 'code');
        same(error.source.name, 'name');

        end();
    })
});
