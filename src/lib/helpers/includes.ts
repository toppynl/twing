export const includes = (map: Map<any, any>, thing: any): boolean => {
    for (const [, value] of map) {
        if (value === thing) {
            return true;
        }
    }

    return false;
};
