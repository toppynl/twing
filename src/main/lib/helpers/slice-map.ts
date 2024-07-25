export function sliceMap(map: Map<any, any>, start: number, length: number, preserveKeys: boolean) {
    let result = new Map();
    let index: number = 0;
    let keyIndex: number = 0;

    if (start < 0) {
        start = map.size + start;
    }

    let end: number;

    if (length >= 0) {
        end = start + length;
    } else {
        end = map.size + length;
    }

    for (let [key, value] of map) {
        if ((index >= start) && (index < end)) {
            let newKey;

            // Note that array_slice() will reorder and reset the ***numeric*** array indices by default. [...]
            // see http://php.net/manual/en/function.array-slice.php
            if (typeof key === "number") {
                newKey = preserveKeys ? key : keyIndex;

                keyIndex++;
            }
            else {
                newKey = key;
            }

            result.set(newKey, value);
        }

        if (index >= end) {
            break;
        }

        index++;
    }

    return result;
}
