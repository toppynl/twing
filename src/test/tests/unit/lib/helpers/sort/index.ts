import tape from "tape";
import {sortAsynchronously} from '../../../../../../main/lib/helpers/sort';

tape('sort helpers', ({test}) => {
    test('sortAsynchronously', ({test}) => {
        type Comparator = (a: any, b: any) => Promise<-1 | 0 | 1>;

        const compareNatively: Comparator = (a, b) => Promise.resolve(a === b ? 0 : (a < b ? -1 : 1));

        const testCases: Array<[
            array: Array<any>,
            comparator: Comparator,
            expectation: Array<any>
        ]> = [
            [[1, 2, 3, 4, 5], compareNatively, [1, 2, 3, 4, 5]],
            [[1, 3, 2, 4, 5], compareNatively, [1, 2, 3, 4, 5]],
            [[1, 3, 4, 2, 5], compareNatively, [1, 2, 3, 4, 5]],
            [[1, 3, 4, 5, 2], compareNatively, [1, 2, 3, 4, 5]],
            [[5, 4, 3, 2, 1], compareNatively, [1, 2, 3, 4, 5]],
            [[5, 3, 4, 2, 1], compareNatively, [1, 2, 3, 4, 5]],
            [[5, 3, 2, 4, 1], compareNatively, [1, 2, 3, 4, 5]],
            [[5, 3, 2, 1, 4], compareNatively, [1, 2, 3, 4, 5]],
        ]

        for (const [array, comparator, expectation] of testCases) {
            test(`${array} => ${expectation}`, ({same, end}) => {
                return sortAsynchronously(array, comparator)
                    .then((result) => {
                        same(result, expectation);
                    })
                    .finally(end);
            });
        }
    });
})

