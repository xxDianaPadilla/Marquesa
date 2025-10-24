const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolver problemas con react-native-maps
config.resolver.assetExts.push('bin');

// Configuración adicional para evitar conflictos
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;