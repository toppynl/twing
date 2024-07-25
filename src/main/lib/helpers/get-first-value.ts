export const getFirstValue = <V>(map: Map<any, V>): V => {
    return Array.from(map.values())[0];
};
