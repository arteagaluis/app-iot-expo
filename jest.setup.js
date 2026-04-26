import 'react-native-gesture-handler/jestSetup';

jest.mock('expo/src/winter/installGlobal', () => ({}));

jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn(),
    getItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
    notificationAsync: jest.fn(),
    impactAsync: jest.fn(),
    selectionAsync: jest.fn(),
    NotificationFeedbackType: {
        Success: 'success',
        Error: 'error',
        Warning: 'warning',
    },
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
}));

jest.mock('expo-font', () => ({
    loadAsync: jest.fn(),
    isLoaded: jest.fn(() => true),
}));

jest.mock('expo-constants', () => ({
    expoConfig: {
        name: 'teliot',
        slug: 'teliot',
    },
}));

jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('expo-router', () => ({
    useRouter: () => ({
        replace: jest.fn(),
        push: jest.fn(),
        back: jest.fn(),
    }),
    useSegments: () => [],
    Link: ({ children }) => children,
}));

jest.mock('expo-blur', () => ({
    BlurView: ({ children }) => children,
}));

jest.mock('expo-auth-session', () => ({
    makeRedirectUri: jest.fn(() => 'test-uri'),
}));

jest.mock('expo-image', () => ({
    Image: 'Image',
}));

jest.mock('react-native-css', () => ({
    useCssElement: (comp, props, options) => {
        const React = require('react');
        return React.createElement(comp, props);
    },
    useNativeVariable: (val) => val,
}));

jest.mock('react-native-safe-area-context', () => {
    const inset = { top: 0, right: 0, bottom: 0, left: 0 };
    return {
        SafeAreaProvider: ({ children }) => children,
        SafeAreaView: ({ children }) => children,
        useSafeAreaInsets: () => inset,
        initialWindowMetrics: {
            frame: { x: 0, y: 0, width: 0, height: 0 },
            insets: inset,
        },
    };
});

jest.mock('react-native-gesture-handler', () => {
    return {
        GestureHandlerRootView: ({ children }) => children,
        Swipeable: ({ children }) => children,
        DrawerLayout: ({ children }) => children,
        State: {},
        PanGestureHandler: ({ children }) => children,
        BaseButton: ({ children }) => children,
        RectButton: ({ children }) => children,
        BorderlessButton: ({ children }) => children,
    };
});
