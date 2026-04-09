import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class OtpUtilityService {
    public aesEncrypt(data: string, encodeKey: string, ivKey: string, encodeInBase64?: boolean): string {
        const cipher = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(encodeKey), {
            iv: CryptoJS.enc.Utf8.parse(ivKey),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        const ciphered = cipher.toString();
        return encodeInBase64 ? btoa(ciphered) : ciphered;
    }

    public aesDecrypt(encodedData: string, encodeKey: string, ivKey: string, isBase64Encoded?: boolean): any {
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
}
