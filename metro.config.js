const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Only add global.css for web builds
if (process.env.EXPO_WEB) {
    module.exports = withNativeWind(config, { input: "./app/global.css" });
} else {
    module.exports = withNativeWind(config);
}
