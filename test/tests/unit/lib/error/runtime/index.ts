import * as tape from "tape";
import {createRuntimeError, isARuntimeError} from "../../../../../../src/lib/error/runtime";

tape('createRuntimeError', ({test}) => {
    test('creates a valid TwingRuntimeError', ({same, end}) => {
        const error = createRuntimeError('foo');

        same(isARuntimeError(error), true);

        end();
    })
});
