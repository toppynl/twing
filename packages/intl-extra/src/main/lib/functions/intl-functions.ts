import * as ct from "countries-and-timezones";

// ISO 639-1 language codes
const ISO_639_1_CODES: string[] = [
    "ab","aa","af","ak","sq","am","ar","an","hy","as","av","ae","ay","az","bm","ba","eu","be","bn","bi",
    "bs","br","bg","my","ca","ch","ce","zh","cu","cv","kw","co","cr","hr","cs","da","dv","nl","dz","en",
    "eo","et","ee","fo","fj","fi","fr","fy","ff","gd","gl","lg","ka","de","el","kl","gn","gu","ht","ha",
    "he","hz","hi","ho","hu","is","io","ig","id","ia","ie","iu","ik","ga","it","ja","jv","kn","kr","ks",
    "kk","km","ki","rw","ky","kv","kg","ko","kj","ku","lo","la","lv","li","ln","lt","lu","lb","mk","mg",
    "ms","ml","mt","gv","mi","mr","mh","mo","mn","na","nv","nd","nr","ng","ne","no","nb","nn","oc","oj",
    "or","om","os","pi","ps","fa","pl","pt","pa","qu","ro","rm","rn","ru","se","sm","sg","sa","sc","sr",
    "sn","sd","si","sk","sl","so","st","es","su","sw","ss","sv","tl","ty","tg","ta","tt","te","th","bo",
    "ti","to","ts","tn","tr","tk","tw","ug","uk","ur","uz","ve","vi","vo","wa","cy","wo","xh","yi","yo",
    "za","zu"
];

// ISO 15924 script codes
const ISO_15924_CODES: string[] = [
    "Adlm","Afak","Aghb","Ahom","Arab","Aran","Armi","Armn","Avst","Bali","Bamu","Bass","Batk","Beng",
    "Bhks","Blis","Bopo","Brah","Brai","Bugi","Buhd","Cans","Cari","Cham","Cher","Chrs","Cirt","Copt",
    "Cpmn","Cprt","Cyrl","Cyrs","Deva","Diak","Dogr","Dsrt","Dupl","Egyd","Egyh","Egyp","Elba","Elym",
    "Ethi","Geok","Geor","Glag","Gong","Gonm","Goth","Gran","Grek","Gujr","Guru","Hanb","Hang","Hani",
    "Hano","Hans","Hant","Hatr","Hebr","Hira","Hluw","Hmng","Hmnp","Hrkt","Hung","Inds","Ital","Jamo",
    "Java","Jpan","Jurc","Kali","Kana","Kawi","Khar","Khmr","Khoj","Kitl","Kits","Knda","Kore","Kpel",
    "Kthi","Lana","Laoo","Latf","Latg","Latn","Lepc","Limb","Lina","Linb","Lisu","Loma","Lyci","Lydi",
    "Mahj","Maka","Mand","Mani","Marc","Maya","Medf","Mend","Merc","Mero","Mlym","Modi","Mong","Moon",
    "Mroo","Mtei","Mult","Mymr","Nagm","Nand","Narb","Nbat","Newa","Nkdb","Nkgb","Nkoo","Nshu","Ogam",
    "Olck","Orkh","Orya","Osge","Osma","Ougr","Palm","Pauc","Perm","Phag","Phli","Phlp","Phlv","Phnx",
    "Plrd","Prti","Qaaa","Qabx","Rjng","Rohg","Roro","Runr","Samr","Sara","Sarb","Saur","Sgnw","Shaw",
    "Shrd","Sidd","Sind","Sinh","Sogd","Sogo","Sora","Soyo","Sund","Sylo","Syrc","Syre","Syrj","Syrn",
    "Tagb","Takr","Tale","Talu","Taml","Tang","Tavt","Telu","Teng","Tfng","Tglg","Thaa","Thai","Tibt",
    "Tirh","Tnsa","Toto","Ugar","Vaii","Visp","Vith","Wara","Wcho","Wole","Xpeo","Xsux","Yezi","Yiii",
    "Zanb","Zinh","Zmth","Zsye","Zsym","Zxxx","Zyyy","Zzzz"
];

const getLocale = (locale: string | null | undefined): string =>
    locale ? locale.replaceAll('_', '-') : new Intl.DateTimeFormat().resolvedOptions().locale;

export const countryTimezonesFunction = (countryCode: string): string[] => {
    const timezones = ct.getTimezonesForCountry(countryCode);
    if (!timezones || timezones.length === 0) {
        throw new Error(`No timezones found for country "${countryCode}"`);
    }
    return timezones.map(tz => tz.name);
};

export const countryNamesFunction = (locale?: string | null): Map<string, string> => {
    const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'region', fallback: 'none'});
    const result = new Map<string, string>();
    for (const country of Object.values(ct.getAllCountries())) {
        const name = displayNames.of(country.id);
        if (name) result.set(country.id, name);
    }
    return result;
};

export const currencyNamesFunction = (locale?: string | null): Map<string, string> => {
    const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'currency', fallback: 'none'});
    const result = new Map<string, string>();
    for (const code of Intl.supportedValuesOf('currency')) {
        const name = displayNames.of(code);
        if (name) result.set(code, name);
    }
    return result;
};

export const timezoneNamesFunction = (locale?: string | null): Map<string, string> => {
    const resolvedLocale = getLocale(locale);
    const date = new Date(Date.UTC(2024, 0, 15));
    const result = new Map<string, string>();
    for (const tz of Intl.supportedValuesOf('timeZone')) {
        try {
            const parts = new Intl.DateTimeFormat(resolvedLocale, {
                timeZone: tz,
                timeZoneName: 'long'
            }).formatToParts(date);
            const tzPart = parts.find(p => p.type === 'timeZoneName');
            if (tzPart) result.set(tz, tzPart.value);
        } catch { /* skip invalid */ }
    }
    return result;
};

export const languageNamesFunction = (locale?: string | null): Map<string, string> => {
    const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'language', fallback: 'none'});
    const result = new Map<string, string>();
    for (const code of ISO_639_1_CODES) {
        const name = displayNames.of(code);
        if (name) result.set(code, name);
    }
    return result;
};

export const scriptNamesFunction = (locale?: string | null): Map<string, string> => {
    const displayNames = new Intl.DisplayNames([getLocale(locale)], {type: 'script', fallback: 'none'});
    const result = new Map<string, string>();
    for (const code of ISO_15924_CODES) {
        try {
            const name = displayNames.of(code);
            if (name) result.set(code, name);
        } catch { /* skip codes that throw */ }
    }
    return result;
};

export const localeNamesFunction = languageNamesFunction;
