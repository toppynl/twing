import tape from "tape";
import {sliceMap} from "../../../../../../main/lib/helpers/slice-map";

tape('slice', (test) => {
    let map = new Map<any, any>([[1, 'foo'], ['bar', 'bar'], [2, 'oof']]);

    test.same(sliceMap(map, 1, 2, false), new Map<any, any>([['bar', 'bar'], [0, 'oof']]));
    test.same(sliceMap(map, 1, 2, true), new Map<any, any>([['bar', 'bar'], [2, 'oof']]));

    test.end();
});
