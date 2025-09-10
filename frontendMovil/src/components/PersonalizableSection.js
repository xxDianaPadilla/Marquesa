import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    ScrollView
} from 'react-native';

// Obtener dimensiones de la pantalla
const { width: screenWidth } = Dimensions.get('window');

// Constantes para diseño responsivo
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
const horizontalPadding = isSmallDevice ? 16 : isMediumDevice ? 20 : 24;
const cardGap = isSmallDevice ? 12 : 16;

export const PersonalizableSection = ({ navigation }) => {
    // Datos de las categorías personalizables 
    const personalizableCategories = [
        {
            id: 'ramo-flores-naturales',
            title: 'Ramos de flores naturales',
            description: 'Arreglos únicos con flores frescas para cada ocasión especial',
            productType: 'Ramo de flores naturales',
            image: require('../images/floresNaturales.jpg'), 
            badgeColor: '#ff6b8a',
            badgeBgColor: '#ffe8ed',
            buttonColor: '#ff6b8a',
            categories: ['Flores naturales', 'Envoltura', 'Liston']
        },
        {
            id: 'ramo-flores-secas',
            title: 'Ramos de flores secas',
            description: 'Diseños duraderos con flores secas de alta calidad y estilo',
            productType: 'Ramo de flores secas',
            image: require('../images/floresSecas.jpeg'), 
            badgeColor: '#00bcd4',
            badgeBgColor: '#e0f8fa',
            buttonColor: '#00bcd4',
            categories: ['Flores secas', 'Envoltura', 'Liston']
        },
        {
            id: 'giftbox',
            title: 'Giftbox',
            description: 'Cajas sorpresa personalizadas con detalles únicos y especiales',
            productType: 'Giftbox',
            image: require('../images/giftbox.jpg'), 
            badgeColor: '#f44336',
            badgeBgColor: '#ffebee',
            buttonColor: '#f44336',
            categories: ['Base para giftbox', 'Comestibles para giftbox', 'Extras']
        }
    ];

    // Función para manejar el clic en personalizar
    const handlePersonalizeClick = (category) => {
        console.log('Navegando a personalización:', category.productType);
        // Navegar a la pantalla de personalización con parámetros
        navigation.navigate('CustomProducts', {
            productType: category.productType,
            categories: category.categories
        });
    };

    return (
        <View style={styles.container}>
            {/* Título de la sección */}
            <View style={styles.titleContainer}>
                <Text style={styles.mainTitle}>Productos Personalizables</Text>
                <Text style={styles.subtitle}>
                    Crea algo único y especial. Personaliza cada detalle para hacer de tu regalo algo inolvidable
                </Text>
            </View>

            {/* ScrollView horizontal para las cards */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollContainer}
                decelerationRate="fast"
                snapToInterval={screenWidth - (horizontalPadding * 2) - cardGap}
                snapToAlignment="start"
            >
                {personalizableCategories.map((category, index) => (
                    <PersonalizableCard
                        key={category.id}
                        category={category}
                        onPersonalizeClick={handlePersonalizeClick}
                        isLast={index === personalizableCategories.length - 1}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const PersonalizableCard = ({ category, onPersonalizeClick, isLast }) => {
    return (
        <View style={[styles.card, isLast && styles.lastCard]}>
            {/* Imagen principal */}
            <View style={styles.imageContainer}>
                <Image
                    source={category.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                />

                {/* Overlay gradient */}
                <View style={styles.imageOverlay} />

                {/* Badge personalizable */}
                <View style={[styles.badge, { backgroundColor: category.badgeBgColor }]}>
                    <View style={styles.badgeIcon} />
                    <Text style={[styles.badgeText, { color: category.badgeColor }]}>
                        Personalizable
                    </Text>
                </View>
            </View>

            {/* Contenido de la card */}
            <View style={styles.cardContent}>
                {/* Título y emoji */}
                <View style={styles.titleRow}>
                    <Text style={styles.cardTitle}>{category.title}</Text>
                    <Text style={styles.titleEmoji}>
                        {category.id === 'ramo-flores-naturales' ? '🌸' :
                            category.id === 'ramo-flores-secas' ? '🌾' : '🎁'}
                    </Text>
                </View>

                {/* Descripción */}
                <Text style={styles.cardDescription}>{category.description}</Text>

                {/* Opciones disponibles */}
                <View style={styles.optionsContainer}>
                    <Text style={styles.optionsTitle}>Opciones disponibles:</Text>
                    <View style={styles.optionsTags}>
                        {category.categories.slice(0, 2).map((cat, index) => (
                            <View key={index} style={styles.optionTag}>
                                <Text style={styles.optionTagText}>{cat}</Text>
                            </View>
                        ))}
                        {category.categories.length > 2 && (
                            <View style={styles.optionTag}>
                                <Text style={styles.optionTagText}>+{category.categories.length - 2}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Características */}
                <View style={styles.featuresContainer}>
                    <View style={[styles.featureTag, { backgroundColor: category.badgeBgColor }]}>
                        <Text style={[styles.featureText, { color: category.badgeColor }]}>✨ Único</Text>
                    </View>
                    <View style={styles.featureTag}>
                        <Text style={styles.featureText}>🎨 Personalizable</Text>
                    </View>
                    <View style={styles.featureTag}>
                        <Text style={styles.featureText}>💝 Especial</Text>
                    </View>
                </View>

                {/* Botón de personalizar */}
                <TouchableOpacity
                    style={[styles.personalizeButton, { backgroundColor: category.buttonColor }]}
                    onPress={() => onPersonalizeClick(category)}
                    activeOpacity={0.8}
                >
                    <View style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Comenzar personalización</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: isSmallDevice ? 24 : 30,
    },
    titleContainer: {
        paddingHorizontal: horizontalPadding,
        marginBottom: isSmallDevice ? 16 : 20,
    },
    mainTitle: {
        fontSize: isSmallDevice ? 20 : isMediumDevice ? 22 : 24,
        fontFamily: 'Poppins-Bold',
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: isSmallDevice ? 12 : 13,
        fontFamily: 'Poppins-Regular',
        color: '#666',
        lineHeight: isSmallDevice ? 16 : 18,
    },
    scrollContainer: {
        overflow: 'visible',
    },
    scrollContent: {
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding - cardGap,
    },
    card: {
        width: screenWidth - (horizontalPadding * 2),
        backgroundColor: '#fff',
        borderRadius: isSmallDevice ? 12 : 16,
        marginRight: cardGap,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    lastCard: {
        marginRight: 0,
    },
    imageContainer: {
        height: isSmallDevice ? 140 : 160,
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    badge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    badgeIcon: {
        width: 8,
        height: 8,
        backgroundColor: '#fff',
        borderRadius: 4,
        marginRight: 4,
    },
    badgeText: {
        fontSize: 10,
        fontFamily: 'Poppins-SemiBold',
    },
    cardContent: {
        padding: isSmallDevice ? 12 : 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: isSmallDevice ? 16 : 18,
        fontFamily: 'Poppins-Bold',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    titleEmoji: {
        fontSize: isSmallDevice ? 20 : 24,
    },
    cardDescription: {
        fontSize: isSmallDevice ? 12 : 13,
        fontFamily: 'Poppins-Regular',
        color: '#666',
        lineHeight: isSmallDevice ? 16 : 18,
        marginBottom: 12,
    },
    optionsContainer: {
        marginBottom: 12,
    },
    optionsTitle: {
        fontSize: 10,
        fontFamily: 'Poppins-Medium',
        color: '#888',
        marginBottom: 6,
    },
    optionsTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    optionTag: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    optionTagText: {
        fontSize: 9,
        fontFamily: 'Poppins-Medium',
        color: '#666',
    },
    featuresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 16,
    },
    featureTag: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    featureText: {
        fontSize: 9,
        fontFamily: 'Poppins-Medium',
        color: '#666',
    },
    personalizeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: isSmallDevice ? 10 : 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonIcon: {
        width: 12,
        height: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 6,
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: isSmallDevice ? 12 : 13,
        fontFamily: 'Poppins-SemiBold',
    },
});