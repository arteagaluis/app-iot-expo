const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for socket.io-client and engine.io-client on React Native / Web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform !== 'web' && moduleName.endsWith('.node.js')) {
    return {
      type: 'empty',
    };
  }
  // Optionally, chain to the standard Metro resolver.
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativewind(config, {
    // Inline variables break PlatformColor in CSS variables
    inlineVariables: false,
    // We add className support manually via component wrappers
    globalClassNamePolyfill: false,
});
