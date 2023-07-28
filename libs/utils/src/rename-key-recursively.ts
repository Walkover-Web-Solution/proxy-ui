/**
 * change key name by provided key value pair in second param
 *
 * @param obj object
 * @param ObjectKeyValuePair key value pair object to replace key from taking value.
 * @returns obj
 */
export function renameKeyRecursively(obj: any, ObjectKeyValuePair: any) {
    for (var k in obj) {
        if (obj[k] instanceof Array && obj[k].length) {
            obj[k].map((all) => {
                renameKeyRecursively(all, ObjectKeyValuePair);
            });
            if (ObjectKeyValuePair[k]) {
                obj[ObjectKeyValuePair[k]] = obj[k];
                delete obj[k];
            }
        } else if (obj[k] instanceof Object && obj[k] !== null) {
            renameKeyRecursively(obj[k], ObjectKeyValuePair);
        } else {
            if (ObjectKeyValuePair[k]) {
                delete Object.assign(obj, {
                    [ObjectKeyValuePair[k]]: obj[k],
                })[k];
            }
        }
    }
    return obj;
}
