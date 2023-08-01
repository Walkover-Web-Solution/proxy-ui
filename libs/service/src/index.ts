export * from './lib/service.module';
export * from './lib/custom.encoder';
export * from './lib/version-check';

export const createUrl = (baseUrl: string, url: string): string => {
    return `${baseUrl}/${url}`;
};
