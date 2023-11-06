import * as tape from "tape";
import {TwingBaseError} from "../../../../../../src/lib/error/base";

tape('TwingBaseError', ({test}) => {
    test('creates a valid TwingRuntimeError', ({same, end}) => {
        const previousError = 'I am Error';
        const error = new TwingBaseError('name', 'message', undefined, undefined, previousError);

        same(error.previous, previousError);

        end();
    })
});
