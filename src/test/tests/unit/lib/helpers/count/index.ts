import tape from "tape";
import {count} from "../../../../../../main/lib/helpers/count";

tape('count', (test) => {
    test.same(count(new Map([['a', 1], ['b', 2]])), 2);
    test.same(count(['a', 'b']), 2);
    test.same(count({a: 1, b: 2}), 2);
    test.same(count('a,b'), 3);

    test.end();
});
