import {
    useCssElement,
    useNativeVariable as useFunctionalVariable,
} from "react-native-css";

import { Link as RouterLink } from "expo-router";
import React from "react";
import {
    Pressable as RNPressable,
    ScrollView as RNScrollView,
    Text as RNText,
    TextInput as RNTextInput,
    TouchableHighlight as RNTouchableHighlight,
    View as RNView,
    StyleSheet,
} from "react-native";
import Animated from "react-native-reanimated";

// CSS-enabled Link
export const Link = (
    props: React.ComponentProps<typeof RouterLink> & { className?: string }
) => {
    return useCssElement(RouterLink, props, { className: "style" });
};

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

// CSS Variable hook
export const useCSSVariable =
    process.env.EXPO_OS !== "web"
        ? useFunctionalVariable
        : (variable: string) => `var(${variable})`;

// View
export type ViewProps = React.ComponentProps<typeof RNView> & {
    className?: string;
};

export const View = React.forwardRef<RNView, ViewProps>((props, ref) => {
    return useCssElement(RNView, { ...props, ref }, { className: "style" });
});
View.displayName = "CSS(View)";

// Text
export const Text = React.forwardRef<RNText, React.ComponentProps<typeof RNText> & { className?: string }>((props, ref) => {
    return useCssElement(RNText, { ...props, ref }, { className: "style" });
});
Text.displayName = "CSS(Text)";

// ScrollView
export const ScrollView = React.forwardRef<RNScrollView, React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
}>((props, ref) => {
    return useCssElement(RNScrollView, { ...props, ref }, {
        className: "style",
        contentContainerClassName: "contentContainerStyle",
    });
});
ScrollView.displayName = "CSS(ScrollView)";

// Pressable
export const Pressable = React.forwardRef<RNView, React.ComponentProps<typeof RNPressable> & { className?: string }>((props, ref) => {
    return useCssElement(RNPressable, { ...props, ref }, { className: "style" });
});
Pressable.displayName = "CSS(Pressable)";

// TextInput
export const TextInput = React.forwardRef<RNTextInput, React.ComponentProps<typeof RNTextInput> & { className?: string }>((props, ref) => {
    return useCssElement(RNTextInput, { ...props, ref }, { className: "style" });
});
TextInput.displayName = "CSS(TextInput)";

// AnimatedScrollView
export const AnimatedScrollView = (
    props: React.ComponentProps<typeof Animated.ScrollView> & {
        className?: string;
        contentClassName?: string;
        contentContainerClassName?: string;
    }
) => {
    return useCssElement(Animated.ScrollView, props, {
        className: "style",
        contentClassName: "contentContainerStyle",
        contentContainerClassName: "contentContainerStyle",
    });
};

// TouchableHighlight with underlayColor extraction
function XXTouchableHighlight(
    props: React.ComponentProps<typeof RNTouchableHighlight>
) {
    // @ts-expect-error: Extract underlayColor from style
    const { underlayColor, ...style } = StyleSheet.flatten(props.style) || {};
    return (
        <RNTouchableHighlight
            underlayColor={underlayColor}
            {...props}
            style={style}
        />
    );
}

export const TouchableHighlight = (
    props: React.ComponentProps<typeof RNTouchableHighlight>
) => {
    return useCssElement(XXTouchableHighlight, props, { className: "style" });
};
TouchableHighlight.displayName = "CSS(TouchableHighlight)";

export * from "./image";
