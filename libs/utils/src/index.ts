export * from './intl-phone-lib.class';
export * from './email-variable-check';
export * from './rename-key-recursively';
export * from './convert-to-utc';

import { Result, getHostNameDetail } from '@proxy/ui/handle-domain';
import * as dayjs from 'dayjs';
import { cloneDeep, pickBy, uniqBy } from 'lodash-es';
import { sha256Encrypt } from './crypto';

interface Domain {
    is_parent_domain: boolean;
    value: string;
}

export function ConvertToDigitTimeToken(value, length = 13) {
    if (value) {
        value = value.toString();

        if (value.length !== length) {
            const muultiplyer = Math.pow(10, length - value.length);
            value = (+value * muultiplyer).toFixed(0);
        }
        return +value;
    }
    return null;
}

/**
 *
 * @param datetime: string | Date.
 * @param timeZone: string[], ["05", "30"] ["hour", "minute"]
 * @param add: boolean, true if want to add
 * @returns string
 */
export function addSubTractDependOnTimeZone(
    datetime: string | Date,
    timeZone: string[],
    add: boolean,
    format: string = 'YYYY-M-DD HH:mm:ss'
) {
    if (add) {
        return dayjs(datetime)
            .add(+timeZone[0], 'h')
            .add(+timeZone[1], 'm')
            .format(format);
    } else {
        return dayjs(datetime)
            .subtract(+timeZone[0], 'h')
            .subtract(+timeZone[1], 'm')
            .format(format);
    }
}

export function extractLatestVariable(value, regex): string {
    let newContent = cloneDeep(value || '');
    let matchContent = newContent.match(regex);
    if (!matchContent) {
        return null;
    }
    let maxNumber = 0;
    while (matchContent) {
        if (matchContent[1].slice(0, 3).toLowerCase() === 'var') {
            const currNumber = +matchContent[1].slice(3);
            maxNumber = maxNumber < currNumber ? currNumber : maxNumber;
        }
        newContent = newContent.replace(regex, matchContent[1]);
        matchContent = newContent.match(regex);
    }
    return 'VAR' + maxNumber.toString();
}

export function RemoveEmptyParam(param: Object) {
    return pickBy(param, (value, key) => {
        //@ts-ignore
        return !(value === undefined || value === null || value === '');
    });
}

export function formatBytes(bytes: number | string, withSpace: boolean = true) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0,
        n = parseInt(bytes.toString(), 10) || 0;
    while (n >= 1024 && ++l) {
        n = n / 1024;
    }
    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + (withSpace ? ' ' : '') + units[l];
}

/**
 * Extracts the parent domain from a sub-domain
 *
 * @param {Array<string>} domains List of domains obtained from API
 * @return {Array<Domain>} List of all the parent and sub-domains
 */
export const extractParentDomain = (domains: Array<string>): Array<Domain> => {
    let filteredDomains: Array<Domain> = [];
    domains.forEach((domain, index) => {
        const domainDetails: Result | Error = getHostNameDetail(domain);
        if (!(domainDetails instanceof Error) && domainDetails.domain) {
            if (domainDetails.domain !== domain) {
                // Parent domain obtained is not the same as domain only then insert both parent and sub-domain
                filteredDomains.push({ is_parent_domain: false, value: domain }); // Sub-domain
                // Check if the obtained parent domain is present in rest of the un-traversed domains in array
                // If present then is_parent_domain should be set to false for API
                const isParent = !domains.slice(index + 1)?.includes(domainDetails.domain);
                filteredDomains.push({ is_parent_domain: isParent, value: domainDetails.domain }); // Parent domain
            } else {
                // Parent domain obtained is the same as domain, just insert single entry
                filteredDomains.push({ is_parent_domain: false, value: domain });
            }
        }
    });
    filteredDomains = uniqBy(filteredDomains, 'value');
    return filteredDomains;
};

export function checkFileExtension(file: File): boolean {
    const allowedExtension = [
        'aif',
        'cda',
        'mid',
        'midi',
        'mp3',
        'mpa',
        'ogg',
        'oga',
        'ogv',
        'ogx',
        'wav',
        'wma',
        'wpl',
        '7z',
        'arj',
        'deb',
        'pkg',
        'rar',
        'rpm',
        'tar',
        'gz',
        'z',
        'zip',
        'dmg',
        'iso',
        'vcd',
        'csv',
        'xml',
        'email',
        'eml',
        'emlx',
        'msg',
        'oft',
        'ost',
        'pst',
        'vcf',
        'fnt',
        'fon',
        'otf',
        'ttf',
        'ai',
        'bmp',
        'gif',
        'ico',
        'jpeg',
        'jpg',
        'png',
        'ps',
        'psd',
        'svg',
        'tif',
        'tiff',
        'cer',
        'cfm',
        'html',
        'ods',
        'xls',
        'xlsm',
        'xlsx',
        '3g2',
        '3gp',
        'avi',
        'flv',
        'h264',
        'm4v',
        'mkv',
        'mov',
        'mp4',
        'mpg',
        'mpeg',
        'rm',
        'swf',
        'vob',
        'wmv',
        'doc',
        'docx',
        'odt',
        'pdf',
        'rtf',
        'tex',
        'txt',
        'wpd',
        'ppt',
        'pptx',
        'ppt',
        'json',
    ];

    return allowedExtension.find((e) => e === file.name.split('.')[file.name.split('.').length - 1].toLocaleLowerCase())
        ? true
        : false;
}

export function fileNotSupportAtUI(url: string): boolean {
    const supportedExtension = ['mkv', '3gp', 'tiff', 'ico'];

    return url
        ? supportedExtension.find((e) => e === url.split('.')[url.split('.').length - 1])
            ? true
            : false
        : true;
}

export function normalizeCommonJSImport<T>(importPromise: Promise<T>): Promise<T> {
    // CommonJS's `module.exports` is wrapped as `default` in ESModule.
    return importPromise.then((m: any) => (m.default || m) as T);
}

function buildFormData(formData, data, parentKey) {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
        Object.keys(data).forEach((key) => {
            buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
        });
    } else {
        const value = data == null ? '' : data;

        formData.append(parentKey, value);
    }
}

export function jsObjectToFormData(data) {
    const formData = new FormData();

    buildFormData(formData, data, '');

    return formData;
}

export function downloadFile(fileUrl) {
    // Create an invisible A element
    const a = document.createElement('a');
    a.style.display = 'none';
    document.body.appendChild(a);

    // Set the HREF to a Blob representation of the data to be downloaded
    a.href = fileUrl;
    // Use download attribute to set set desired file name
    a.setAttribute('download', fileUrl.split('/')[fileUrl.split('/').length - 1]);
    // a.setAttribute('target','_blank')
    // Trigger the download by simulating click
    a.click();
    // Cleanup
    // window.URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
}

export function downloadCSVFile(content, fileName): void {
    let csvContent = 'data:text/csv;charset=utf-8,' + content;
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Recursively remove keys with empty data
 *
 * @export
 * @param {{ [key: string]: any }} data
 * @param {boolean} [removeEmptyObject] true, If you want to remove empty object also
 * @return {*}  { [key: string]: any }
 */
export function removeEmptyKeys(data: { [key: string]: any }, removeEmptyObject?: boolean): { [key: string]: any } {
    Object.keys(data).forEach((key) => {
        if (data[key] === null || data[key] === undefined || data[key] === '') {
            delete data[key];
        } else if (typeof data[key] === 'object') {
            data[key] = removeEmptyKeys(data[key]);
            if (removeEmptyObject && !Object.keys(data[key] ?? {})?.length) {
                delete data[key];
            }
        }
    });
    return data;
}

/**
 * get Regex for type checking for input type file
 *
 * @export
 * @param {string} acceptString accept string provided in input
 * @return {*}  {string}
 */
export function getAcceptedTypeRegex(acceptString: string): string {
    return acceptString
        .replaceAll(/\s*,\s*/g, '|')
        .replaceAll('/', '\\/')
        .replaceAll('.', '\\.')
        .replaceAll('*', '.*');
}

export function generateJwtToken(payload: { [key: string]: any }, secret: string): string {
    const jwtHeaders = {
        alg: 'HS256',
        typ: 'JWT',
    };
    return sha256Encrypt(jwtHeaders, payload, secret);
}
