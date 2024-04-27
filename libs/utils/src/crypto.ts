import * as CryptoJS from 'crypto-js';

export function aesEncrypt(data: string, encodeKey: string, ivKey: string): string {
    const cipher = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(encodeKey), {
        iv: CryptoJS.enc.Utf8.parse(ivKey),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return cipher.toString();
}

export function aesDecrypt(encodedData: string, encodeKey: string, ivKey: string, isBase64Encoded?: boolean): any {
    const cipher = CryptoJS.AES.decrypt(
        isBase64Encoded ? atob(encodedData) : encodedData,
        CryptoJS.enc.Utf8.parse(encodeKey),
        {
            iv: CryptoJS.enc.Utf8.parse(ivKey),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }
    );
    return cipher.toString(CryptoJS.enc.Utf8);
}

export function sha256Encrypt(header: any, data: any, secret: string): string {
    const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
    const encodedHeader = base64Encode(stringifiedHeader);

    const stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
    const encodedData = base64Encode(stringifiedData);

    let signature = encodedHeader + '.' + encodedData;
    signature = CryptoJS.HmacSHA256(signature, secret);
    signature = base64Encode(signature);
    return `${encodedHeader}.${encodedData}.${signature}`;
}

export function sha256Decrypt(
    encodedData: string,
    secret: string,
    isBase64Encoded?: boolean
): { header: { [key: string]: any }; body: { [key: string]: any }; verified: boolean } {
    const splitData = (isBase64Encoded ? base64Decode(encodedData) : encodedData).split('.');
    if (splitData.length !== 3) {
        throw new Error('Invalid JWT');
    }
    try {
        const decodedHeader = CryptoJS.enc.Utf8.stringify(base64Decode(splitData[0]));
        const decodedData = CryptoJS.enc.Utf8.stringify(base64Decode(splitData[1]));
        let signature = CryptoJS.HmacSHA256(`${splitData[0]}.${splitData[1]}`, secret);
        signature = base64Encode(signature);
        return {
            header: JSON.parse(decodedHeader),
            body: JSON.parse(decodedData),
            verified: signature === splitData[2],
        };
    } catch (e) {
        throw new Error('Invalid JWT');
    }
}

export function base64Encode(source): string {
    // Encode in classical base64
    let encodedSource = CryptoJS.enc.Base64.stringify(source);

    // Remove padding equal characters
    encodedSource = encodedSource.replace(/=+$/, '');

    // Replace characters according to base64Encode specifications
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');

    return encodedSource;
}

export function base64Decode(base64): string {
    // Replace characters according to base64Encode specifications
    base64 = base64.replace(/-/g, '+');
    base64 = base64.replace(/_/g, '\\');

    // Decode in normal text
    const decodedSource = CryptoJS.enc.Base64.parse(base64);
    return decodedSource;
}
