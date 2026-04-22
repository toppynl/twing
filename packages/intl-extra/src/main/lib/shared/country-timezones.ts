import * as ct from "countries-and-timezones";

export const resolveCountryTimezones = (countryCode: string): string[] => {
    const timezones = ct.getTimezonesForCountry(countryCode);
    if (!timezones || timezones.length === 0) {
        throw new Error(`No timezones found for country "${countryCode}"`);
    }
    return timezones.map(tz => tz.name);
};
