import * as tape from 'tape';
import {isIn} from "../../../../../../src/lib/helpers/is-in";

tape('is-in', ({same, end}) => {
    same(isIn(1, [1, 2]), true);
    same(isIn(2, [1, 2]), true);
    same(isIn(1, {foo: 1, bar: 2}), true);
    same(isIn(2, {foo: 1, bar: 2}), true);

    end();
});
