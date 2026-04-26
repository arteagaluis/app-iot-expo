module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    setupFiles: ['./jest.setup.js'],
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-css|nativewind|expo-router|expo-auth-session|expo-constants|expo-crypto|expo-linking|expo-secure-store|expo-splash-screen|expo-status-bar|expo-symbols|expo-system-ui|expo-web-browser)',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    },
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}',
        '!**/node_modules/**',
        '!**/jest.setup.js',
        '!**/dummy.test.ts',
    ],
    coverageThreshold: {
        global: {
            statements: 70,
            branches: 50,
            functions: 70,
            lines: 70,
        },
    },
};
