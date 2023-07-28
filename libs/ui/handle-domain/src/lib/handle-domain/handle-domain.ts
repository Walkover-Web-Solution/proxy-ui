import { Injectable } from '@angular/core';
import * as data from '../rules.json';
import { hasTld, suffixLookup, extractTldFromHost, extractDomainWithSuffix } from './utils';

export interface Result {
    hostname: string | '';
    publicSuffix: string | null;
    domain: string | null;
    subdomain: string | null;
}

export const getHostNameDetail = (param: string) => {
    if (param && param.length > 0) {
        const handleDomain = new HandleDomain(param);
        return handleDomain.parse();
    } else {
        return new Error('Host name is required');
    }
};

class HandleDomain {
    public rules: any = (data as any).default;
    private param: string;

    constructor(param: string) {
        this.param = param;
    }

    public parse(): Result | Error {
        const result: Result = {
            hostname: typeof this.param === 'string' ? this.param : '',
            publicSuffix: null,
            domain: null,
            subdomain: null,
        };
        if (result.hostname !== '') {
            result.publicSuffix = this.getPublicSuffix(result.hostname);
            if (!result.publicSuffix) {
                return new Error('Invalid top level domain.');
            }
            result.domain = this.getDomain(result.publicSuffix, result.hostname);
            result.subdomain = this.getSubdomain(result.hostname, result.domain);
            return result;
        }
    }

    private getPublicSuffix(hostname): string {
        // First check if `hostname` is already a valid top-level Domain.
        if (hasTld(this.rules, hostname)) {
            return hostname;
        }

        const candidate = suffixLookup(this.rules, hostname);
        if (candidate === null) {
            // Prevailing rule is '*' so we consider the top-level domain to be the
            // public suffix of `hostname` (e.g.: 'example.org' => 'org').
            return extractTldFromHost(hostname);
        }

        return candidate;
    }

    private getDomain(suffix, hostname) {
        // If there is no suffix, there is no hostname
        if (suffix === null) {
            return null;
        }

        // If `hostname` is a valid public suffix, then there is no domain to return.
        // Since we already know that `getPublicSuffix` returns a suffix of `hostname`
        // there is no need to perform a string comparison and we only compare the
        // size.
        if (suffix.length === hostname.length) {
            return null;
        }

        // To extract the general domain, we start by identifying the public suffix
        // (if any), then consider the domain to be the public suffix with one added
        // level of depth. (e.g.: if hostname is `not.evil.co.uk` and public suffix:
        // `co.uk`, then we take one more level: `evil`, giving the final result:
        // `evil.co.uk`).
        return extractDomainWithSuffix(hostname, suffix);
    }

    private getSubdomain(hostname, domain) {
        // No domain found? Just abort, abort!
        if (domain === null) {
            return null;
        }

        return hostname.substr(0, hostname.length - domain.length - 1);
    }
}
