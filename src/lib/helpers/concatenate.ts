export const concatenate = (object1: any, object2: any): string => {
    if ((object1 === null) || (object1 === undefined)) {
        object1 = '';
    }

    if ((object2 === null) || (object2 === undefined)) {
        object2 = '';
    }

    return String(object1) + String(object2);
};
