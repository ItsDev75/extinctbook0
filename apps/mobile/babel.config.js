module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["./"],
                    alias: {
                        "@": "./src",
                        "@extinctbook/shared": "../../packages/shared/src/index.ts",
                    },
                },
            ],
            "react-native-reanimated/plugin",
        ],
    };
};
