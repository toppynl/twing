export const getRecordSize = <Key extends string | number | symbol, Value extends any>(record: Record<Key, Value>): number => {
    return Object.keys(record).length;
};

export const pushToRecord = <Key extends string | number | symbol, Value extends any>(record: Record<Key, Value>, value: Value) => {
    const size = getRecordSize(record);

    record[size] = value;
};
