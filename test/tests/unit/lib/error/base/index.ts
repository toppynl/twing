import * as tape from "tape";
import {createBaseError} from "../../../../../../src/lib/error/base";

tape('createBaseError', ({test}) => {
    test('creates a valid TwingRuntimeError', ({same, end}) => {
        const previousError = 'I am Error';
        const error = createBaseError('name', 'message', undefined, undefined, previousError);

        same(error.previous, previousError);
        same(error.rootMessage, 'message');

        end();
    })
});
