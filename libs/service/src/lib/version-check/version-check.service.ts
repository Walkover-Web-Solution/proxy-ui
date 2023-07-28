import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { VersionCheckServiceModule } from '.';

@Injectable({
    providedIn: VersionCheckServiceModule,
})
export class VersionCheckService {
    /** Subject to store version change status */
    public onVersionChange$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    /** This will be replaced by actual hash */
    private currentHash = '{{POST_BUILD_ENTERS_HASH_HERE}}';

    constructor(private http: HttpClient) {}

    /**
     * Checks in every set frequency the version of frontend application
     *
     * @param {*} url URL of version.json
     * @param {number} [frequency=1000 * 60 * 1] in milliseconds, defaults to 1 minute
     * @memberof VersionCheckService
     */
    public initVersionCheck(url, frequency = 1000 * 60 * 1) {
        // will check in every 1 minutes
        this.checkVersion(url);

        setInterval(() => {
            this.checkVersion(url);
        }, frequency);
    }

    /**
     * Will do the call and check if the hash has changed or not
     *
     * @private
     * @param {*} url URL of version.json
     * @memberof VersionCheckService
     */
    private checkVersion(url) {
        // timestamp these requests to invalidate caches
        this.http
            .get(url + '?t=' + new Date().getTime())
            .pipe(take(1))
            .subscribe(
                (response: any) => {
                    const hash = response.hash;
                    const hashChanged = this.hasHashChanged(this.currentHash, hash);

                    if (hashChanged) {
                        this.onVersionChange$.next(true);
                    }
                    // store the new hash so we wouldn't trigger versionChange again
                    this.currentHash = hash;
                },
                (err) => {
                    console.error(err, 'Could not get version');
                }
            );
    }

    /**
     * Checks if hash has changed.
     * This file has the JS hash, if it is a different one than in the version.json
     * we are dealing with version change
     *
     * @private
     * @param {string} currentHash Current hash
     * @param {string} newHash New Hash
     * @return {boolean} True, if hash has changed
     * @memberof VersionCheckService
     */
    private hasHashChanged(currentHash: string, newHash: string): boolean {
        if (!currentHash || currentHash === '{{POST_BUILD_ENTERS_HASH_HERE}}') {
            return false;
        }
        return currentHash !== newHash;
    }
}
