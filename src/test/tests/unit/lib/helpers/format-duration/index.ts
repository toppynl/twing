import tape from "tape";
import {Duration} from "luxon";
import {formatDuration} from "../../../../../../main/lib/helpers/format-duration";

tape('formatDuration', ({test}) => {
    const positiveDuration = Duration.fromISO('P5Y5M5DT5H5M5S');
    
    positiveDuration.set({
        millisecond: 5
    });

    const negativeDuration = Duration.fromISO('P-5Y');

    const testCases: Array<[duration: Duration, format: string, expectation: string]> = [
        [positiveDuration, '%Y', '05'],
        [positiveDuration, '%y', '5'],
        [positiveDuration, '%M', '05'],
        [positiveDuration, '%m', '5'],
        [positiveDuration, '%D', '05'],
        [positiveDuration, '%d', '5'],
        [positiveDuration, '%H', '05'],
        [positiveDuration, '%h', '5'],
        [positiveDuration, '%I', '05'],
        [positiveDuration, '%i', '5'],
        [positiveDuration, '%S', '05'],
        [positiveDuration, '%s', '5'],
        [positiveDuration, '%F', '005000'],
        [positiveDuration, '%f', '5000'],
        [positiveDuration, '%R', '+'],
        [positiveDuration, '%r', ''],
        [negativeDuration, '%R', '-'],
        [negativeDuration, '%r', '-'],
    ];
    
    for (const [duration, format, expectation] of testCases) {
        test(`${format} => ${expectation}`, ({same, end}) => {
            same(formatDuration(duration, format), expectation);

            end();
        });
    }
});
