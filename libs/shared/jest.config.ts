/* eslint-disable */
export default {
    displayName: 'shared',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        },
    },
    coverageDirectory: '../../coverage/libs/shared',
};
