import * as tape from "tape";
import {isARuntimeError, TwingRuntimeError} from "../../../../../../src/lib/error/runtime";

tape('TwingRuntimeError', ({test}) => {
    test('creates a valid TwingRuntimeError', ({same, end}) => {
        const error = new TwingRuntimeError('foo');

        same(isARuntimeError(error), true);

        end();
    })
});
