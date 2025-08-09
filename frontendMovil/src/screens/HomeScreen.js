// Importamos React y el hook useState para manejar el estado local del componente
import React, { useState } from "react";
// Importamos los componentes nativos de React Native que vamos a utilizar
import {
    View,           // Contenedor básico equivalente a un div
    TouchableOpacity, // Botón táctil que detecta toques
    Image,          // Componente para mostrar imágenes
    StyleSheet,     // Para crear estilos CSS-like
    Text,           // Componente para mostrar texto
    FlatList,       // Lista optimizada para renderizar muchos elementos
    Dimensions,     // Para obtener dimensiones de la pantalla
    ScrollView      // Contenedor scrolleable
} from "react-native";
// Importamos nuestro contexto de autenticación personalizado
import { useAuth } from "../context/AuthContext";
// Importamos la imagen del ícono de perfil
import perfilIcon from "../images/perfilIcon.png";
// Importamos el componente personalizado para mostrar productos
import ProductCard from "../components/Products/ProductCard";
// Importamos nuestro hook personalizado para obtener productos
import useFetchProducts from "../hooks/useFetchProducts";
// Importamos íconos de Material Icons
import Icon from 'react-native-vector-icons/MaterialIcons';

// Obtenemos las dimensiones de la pantalla del dispositivo
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Calculamos valores responsivos basados en el ancho de pantalla
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
const isLargeDevice = screenWidth >= 414;

// Padding horizontal responsivo
const horizontalPadding = isSmallDevice ? 16 : isMediumDevice ? 20 : 24;
// Gap entre elementos
const elementGap = isSmallDevice ? 8 : isMediumDevice ? 10 : 12;

// Definimos el componente funcional HomeScreen que recibe navigation como prop
export default function HomeScreen({ navigation }) {
    // Obtenemos datos del usuario y userInfo del contexto de autenticación
    const { user, userInfo } = useAuth();
    // Obtenemos la lista de productos y el estado de carga del hook personalizado
    const { productos, loading } = useFetchProducts();
    // Estado local para manejar la categoría seleccionada, inicialmente 'Todo'
    const [selectedCategory, setSelectedCategory] = useState('Todo');

    // Array con las categorías disponibles para filtrar productos
    const categories = ['Todo', 'Naturales', 'Secas', 'Tarjetas', 'Cuadros', 'Giftboxes'];

    // Función que maneja la navegación al perfil cuando se presiona el botón
    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    // Función que maneja la navegación al detalle del producto
    const handleProductPress = (product) => {
        // Navegar a la pantalla de detalle pasando el ID del producto
        navigation.navigate('ProductDetail', { productId: product._id });
    };

    // Función que maneja agregar un producto al carrito
    const handleAddToCart = (product) => {
        // Por ahora solo muestra un log, aquí iría la lógica del carrito
        console.log('Agregar al carrito:', product);
    };

    // Función que maneja el toggle de favoritos
    const handleToggleFavorite = (product) => {
        // Por ahora solo muestra un log, aquí iría la lógica de favoritos
        console.log('Toggle favorito:', product);
    };

    // Filtramos los productos basado únicamente en la categoría seleccionada
    const filteredProducts = productos.filter(product => {
        // Verificamos si la categoría coincide ('Todo' muestra todos, sino filtra por categoría)
        const matchesCategory = selectedCategory === 'Todo' ||
            product.category?.toLowerCase().includes(selectedCategory.toLowerCase());
        return matchesCategory;
    });

    // Función que renderiza cada producto en la FlatList
    const renderProduct = ({ item, index }) => (
        // Wrapper para cada card con estilos y margin condicional
        <View style={[styles.cardWrapper, { marginRight: index % 2 === 0 ? elementGap : 0 }]}>
            {/* Componente ProductCard que muestra la información del producto */}
            <ProductCard
                product={item}                    // Datos del producto
                onPress={handleProductPress}      // Función para navegar al detalle
                onAddToCart={handleAddToCart}     // Función para agregar al carrito
                onToggleFavorite={handleToggleFavorite} // Función para toggle de favorito
                isFavorite={false}               // Estado de favorito (hardcodeado por ahora)
            />
        </View>
    );

    // Renderizado del componente
    return (
        // Contenedor principal de toda la pantalla
        <View style={styles.container}>
            {/* Header con botón de perfil */}
            <View style={styles.header}>
                {/* Botón táctil que navega al perfil */}
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={handleProfilePress}
                >
                    {/* Imagen del ícono de perfil */}
                    <Image source={perfilIcon} style={styles.icon} />
                </TouchableOpacity>
            </View>

            {/* Contenedor del título principal */}
            <View style={styles.titleContainer}>
                {/* Primera línea del título */}
                <Text style={styles.mainTitle}>Descubre formas de</Text>
                {/* Segunda línea del título */}
                <Text style={styles.mainTitle}>sorprender</Text>
            </View>

            {/* Contenedor de la barra de búsqueda con botón de filtros */}
            <View style={styles.searchWrapper}>
                {/* Botón de filtros (ícono de tune/ajustes) */}
                <TouchableOpacity style={styles.filterIconButton}>
                    <Icon name="tune" size={isSmallDevice ? 18 : 20} color="#999" />
                </TouchableOpacity>
                {/* Botón de búsqueda que navega a la pantalla de búsqueda */}
                <View style={styles.searchContainer}>
                    <TouchableOpacity 
                        style={styles.searchTouchable}
                        onPress={() => navigation.navigate('Search')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.searchPlaceholder}>¿Qué estás buscando?</Text>
                        <View style={styles.searchButton}>
                            <Icon name="search" size={isSmallDevice ? 18 : 20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Contenedor para el scroll horizontal de categorías - MEJORADO PARA RESPONSIVIDAD */}
            <View style={styles.categoryScrollContainer}>
                {/* ScrollView horizontal para las categorías */}
                <ScrollView
                    horizontal                          // Hace el scroll horizontal
                    showsHorizontalScrollIndicator={false} // Oculta la barra de scroll
                    contentContainerStyle={styles.categoryContainer} // Estilos del contenido
                    style={styles.categoryScrollView}   // Estilos del ScrollView
                    bounces={true}                      // Permite bounce en iOS
                    decelerationRate="fast"             // Desaceleración rápida
                    snapToAlignment="start"             // Snap al inicio
                    snapToInterval={undefined}          // Sin interval fijo para mejor scroll
                >
                    {/* Mapeamos cada categoría para crear los botones */}
                    {categories.map((category, index) => (
                        // Botón táctil para cada categoría
                        <TouchableOpacity
                            key={category}              // Key única para React
                            style={[
                                styles.categoryButton,  // Estilo base del botón
                                // Si la categoría está seleccionada, aplica estilo activo
                                selectedCategory === category && styles.categoryButtonActive,
                                // Margen específico para el último elemento
                                index === categories.length - 1 && styles.lastCategoryButton
                            ]}
                            onPress={() => setSelectedCategory(category)} // Cambia la categoría seleccionada
                            activeOpacity={0.7}         // Opacidad al presionar
                        >
                            {/* Texto de la categoría */}
                            <Text
                                style={[
                                    styles.categoryText, // Estilo base del texto
                                    // Si está seleccionada, aplica estilo de texto activo
                                    selectedCategory === category && styles.categoryTextActive
                                ]}
                                numberOfLines={1}       // Una sola línea
                                adjustsFontSizeToFit={isSmallDevice} // Ajusta tamaño en dispositivos pequeños
                                minimumFontScale={0.85} // Escala mínima del texto
                            >
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Lista de productos en grid de 2 columnas */}
            <FlatList
                data={filteredProducts}               // Datos filtrados de productos
                renderItem={renderProduct}           // Función que renderiza cada item
                keyExtractor={(item) => item._id}     // Extrae la key única de cada item
                numColumns={2}                        // Número de columnas (grid)
                contentContainerStyle={styles.productsContainer} // Estilos del contenedor
                showsVerticalScrollIndicator={false}  // Oculta barra de scroll vertical
                columnWrapperStyle={styles.row}       // Estilos para cada fila del grid
                initialNumToRender={10}               // Renderiza 10 items inicialmente
                maxToRenderPerBatch={10}              // Máximo por batch
                windowSize={10}                       // Tamaño de ventana
                removeClippedSubviews={true}          // Mejora performance
                getItemLayout={(data, index) => ({     // Layout fijo para mejor performance
                    length: 200,
                    offset: 200 * Math.floor(index / 2),
                    index,
                })}
            />

            {/* Barra de navegación inferior fija */}
            <View style={styles.bottomNav}>
                {/* Botón de Home (activo) */}
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="home" size={isSmallDevice ? 22 : 24} color="#ff6b8a" />
                </TouchableOpacity>
                {/* Botón de Favoritos (inactivo) */}
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="favorite-border" size={isSmallDevice ? 22 : 24} color="#ccc" />
                </TouchableOpacity>
                {/* Botón de Chat (inactivo) */}
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="chat-bubble-outline" size={isSmallDevice ? 22 : 24} color="#ccc" />
                </TouchableOpacity>
                {/* Botón de Carrito (inactivo) */}
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="shopping-cart" size={isSmallDevice ? 22 : 24} color="#ccc" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Definición de estilos usando StyleSheet - COMPLETAMENTE RESPONSIVOS
const styles = StyleSheet.create({
    // Contenedor principal de toda la pantalla
    container: {
        flex: 1,                    // Ocupa todo el espacio disponible
        backgroundColor: "#ffffff", // Fondo blanco
        paddingTop: isSmallDevice ? 45 : 50, // Padding superior responsivo
    },
    // Contenedor del header
    header: {
        flexDirection: 'row',       // Elementos en fila horizontal
        justifyContent: 'flex-end', // Alinea contenido a la derecha
        alignItems: 'center',       // Centra verticalmente
        paddingHorizontal: horizontalPadding, // Padding horizontal responsivo
        marginBottom: isSmallDevice ? 16 : 20, // Margen inferior responsivo
    },
    // Estilo del botón de perfil
    profileButton: {
        width: isSmallDevice ? 28 : 30,     // Ancho responsivo
        height: isSmallDevice ? 28 : 30,    // Alto responsivo
    },
    // Estilo del ícono dentro del botón
    icon: {
        width: "100%",              // Ancho al 100% del contenedor
        height: "100%",             // Alto al 100% del contenedor
        resizeMode: "contain",      // Mantiene proporciones de la imagen
    },
    // Contenedor del título principal
    titleContainer: {
        paddingHorizontal: horizontalPadding, // Padding horizontal responsivo
        marginBottom: isSmallDevice ? 24 : 30, // Margen inferior responsivo
    },
    // Estilo del texto del título principal
    mainTitle: {
        fontSize: isSmallDevice ? 24 : isMediumDevice ? 26 : 28, // Tamaño responsivo
        fontFamily: 'Poppins-Bold', // Fuente Poppins en negrita
        color: '#333',              // Color gris oscuro
        lineHeight: isSmallDevice ? 28 : isMediumDevice ? 30 : 34, // Altura de línea responsiva
    },
    // Contenedor wrapper de la búsqueda
    searchWrapper: {
        flexDirection: 'row',       // Elementos en fila
        alignItems: 'center',       // Centra verticalmente
        marginHorizontal: horizontalPadding, // Margen horizontal responsivo
        marginBottom: isSmallDevice ? 16 : 20, // Margen inferior responsivo
        gap: elementGap,            // Espacio entre elementos responsivo
    },
    // Botón de filtros (ícono tune)
    filterIconButton: {
        width: isSmallDevice ? 45 : 50,     // Ancho responsivo
        height: isSmallDevice ? 45 : 50,    // Alto responsivo
        borderRadius: isSmallDevice ? 12 : 15, // Radio responsivo
        backgroundColor: '#fff',     // Fondo blanco
        borderWidth: 2,             // Borde de 2px
        borderColor: '#f5c7e6ff',   // Color de borde rosado
        justifyContent: 'center',    // Centra contenido horizontalmente
        alignItems: 'center',       // Centra contenido verticalmente
        shadowColor: '#000',        // Color de sombra negro
        shadowOffset: {             // Offset de la sombra
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,         // Opacidad de sombra al 10%
        shadowRadius: 4,            // Radio de difusión de sombra
        elevation: 3,               // Elevación para Android
    },
    // Contenedor de la barra de búsqueda
    searchContainer: {
        flex: 1,                    // Ocupa el espacio restante
        position: 'relative',       // Posicionamiento relativo para elementos absolutos
        backgroundColor: '#fff',     // Fondo blanco
        borderRadius: 25,           // Bordes muy redondeados
        maxWidth: screenWidth - (horizontalPadding * 2) - (isSmallDevice ? 45 : 50) - elementGap, // Ancho máximo calculado
        shadowColor: '#000',        // Color de sombra
        shadowOffset: {             // Offset de sombra
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,         // Opacidad de sombra
        shadowRadius: 4,            // Radio de sombra
        elevation: 3,               // Elevación para Android
    },
    // TouchableOpacity dentro del container
    searchTouchable: {
        flexDirection: 'row',       // Elementos en fila
        alignItems: 'center',       // Centra verticalmente
        position: 'relative',       // Para posicionar la lupita
    },
    // Texto placeholder de búsqueda
    searchPlaceholder: {
        flex: 1,
        fontSize: isSmallDevice ? 12 : 14,  // Tamaño de fuente responsivo
        fontFamily: 'Poppins-Regular', // Fuente Poppins regular
        color: '#999',              // Color de texto placeholder
        paddingVertical: isSmallDevice ? 12 : 15, // Padding vertical responsivo
        paddingLeft: isSmallDevice ? 12 : 15,     // Padding izquierdo responsivo
        paddingRight: isSmallDevice ? 45 : 50,    // Padding derecho responsivo
        borderWidth: 1,             // Borde de 1px
        borderColor: '#e5e7eb',     // Color de borde gris claro
        borderRadius: 25,           // Bordes redondeados
        backgroundColor: '#fff',     // Fondo blanco
    },
    // Botón de búsqueda (lupa)
    searchButton: {
        position: 'absolute',       // Posicionamiento absoluto
        right: 1,                   // Pegado al borde derecho con pequeño margen
        top: 1,                     // Pegado al borde superior con pequeño margen
        bottom: 1,                  // Pegado al borde inferior con pequeño margen
        width: isSmallDevice ? 45 : 50,     // Ancho responsivo
        height: isSmallDevice ? 43 : 50,    // Alto responsivo (un poco menos para el margen)
        backgroundColor: '#f5c7e6ff', // Fondo rosado
        borderTopLeftRadius: 0,     // Sin redondeo superior izquierdo
        borderBottomLeftRadius: 23, // Redondeo inferior izquierdo
        borderTopRightRadius: 23,   // Redondeo superior derecho
        borderBottomRightRadius: 23, // Redondeo inferior derecho
        justifyContent: 'center',   // Centra contenido horizontalmente
        alignItems: 'center',       // Centra contenido verticalmente
        overflow: 'hidden',         // Oculta contenido que se desborde
    },

    // ESTILOS DE CATEGORÍAS COMPLETAMENTE RESPONSIVOS
    // Contenedor del scroll de categorías
    categoryScrollContainer: {
        marginBottom: isSmallDevice ? 10 : 12, // Margen inferior responsivo REDUCIDO
        height: isSmallDevice ? 50 : 55,       // Altura fija responsiva
    },
    // Estilos del ScrollView de categorías
    categoryScrollView: {
        flexGrow: 0,                // No crece más allá de su contenido
        overflow: 'visible',        // Hace visible el contenido que se desborda
    },
    // Contenedor del contenido de categorías
    categoryContainer: {
        paddingHorizontal: horizontalPadding, // Padding horizontal responsivo
        paddingRight: horizontalPadding + 20,  // Padding adicional a la derecha
        alignItems: 'center',       // Centra verticalmente los botones
        minHeight: isSmallDevice ? 45 : 50,    // Altura mínima
    },
    // Estilo de cada botón de categoría - MEJORADO
    categoryButton: {
        paddingHorizontal: isSmallDevice ? 14 : isMediumDevice ? 16 : 18, // Padding horizontal responsivo
        paddingVertical: isSmallDevice ? 10 : 12, // Padding vertical responsivo
        borderRadius: isSmallDevice ? 18 : 20,    // Bordes redondeados responsivos
        backgroundColor: '#fff',     // Fondo blanco
        marginRight: isSmallDevice ? 8 : elementGap, // Margen derecho responsivo
        shadowColor: '#000',        // Color de sombra
        shadowOffset: {             // Offset de sombra
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,        // Opacidad de sombra más suave
        shadowRadius: 3,            // Radio de sombra
        elevation: 2,               // Elevación para Android
        minWidth: isSmallDevice ? 60 : 70,        // Ancho mínimo responsivo
        alignItems: 'center',       // Centra el texto
        justifyContent: 'center',   // Centra verticalmente el texto
        flexShrink: 0,              // No se encoge
    },
    // Estilo del último botón de categoría (margen extra)
    lastCategoryButton: {
        marginRight: 0,             // Sin margen derecho en el último
    },
    // Estilo del botón de categoría cuando está activo
    categoryButtonActive: {
        backgroundColor: '#4A4170',  // Fondo morado cuando está seleccionado
        shadowColor: '#4A4170',     // Sombra del mismo color
        shadowOpacity: 0.3,         // Sombra más visible cuando está activo
        elevation: 4,               // Mayor elevación cuando está activo
    },
    // Estilo del texto de categoría
    categoryText: {
        fontSize: isSmallDevice ? 12 : isMediumDevice ? 13 : 14, // Tamaño responsivo
        fontFamily: 'Poppins-Medium', // Fuente Poppins medium
        color: '#1b1b1bff',         // Color de texto gris oscuro
        textAlign: 'center',        // Texto centrado
        lineHeight: isSmallDevice ? 14 : isMediumDevice ? 15 : 16, // Altura de línea responsiva
    },
    // Estilo del texto cuando la categoría está activa
    categoryTextActive: {
        color: '#FFFFFF',           // Color blanco para contraste con fondo morado
        fontFamily: 'Poppins-SemiBold', // Fuente más bold cuando está activo
    },

    // ESTILOS DE PRODUCTOS RESPONSIVOS
    // Contenedor de la lista de productos
    productsContainer: {
        paddingHorizontal: horizontalPadding, // Padding horizontal responsivo
        paddingTop: 5,              // Padding superior REDUCIDO para separar de categorías
        paddingBottom: isSmallDevice ? 90 : 100, // Padding inferior responsivo
    },
    // Estilo de cada fila en el grid
    row: {
        justifyContent: 'space-between', // Distribuye espacio entre columnas
        marginBottom: isSmallDevice ? 12 : 16, // Margen inferior responsivo
        paddingHorizontal: 2,       // Pequeño padding para evitar cortes
    },
    // Wrapper de cada card de producto
    cardWrapper: {
        // Ancho calculado responsivo
        width: (screenWidth - (horizontalPadding * 2) - elementGap - 4) / 2,
        minHeight: isSmallDevice ? 180 : 200, // Altura mínima responsiva
    },

    // BARRA DE NAVEGACIÓN RESPONSIVA
    // Barra de navegación inferior
    bottomNav: {
        position: 'absolute',       // Posición fija
        bottom: 0,                  // Pegada al fondo
        left: 0,                    // Pegada a la izquierda
        right: 0,                   // Pegada a la derecha
        flexDirection: 'row',       // Elementos en fila
        backgroundColor: '#fff',     // Fondo blanco
        paddingVertical: isSmallDevice ? 12 : 16, // Padding vertical responsivo
        paddingHorizontal: horizontalPadding,     // Padding horizontal responsivo
        justifyContent: 'space-around', // Distribuye elementos uniformemente
        shadowColor: '#000',        // Color de sombra
        shadowOffset: {             // Sombra hacia arriba
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.1,         // Opacidad de sombra
        shadowRadius: 6,            // Radio de sombra
        elevation: 8,               // Elevación alta para Android
        minHeight: isSmallDevice ? 70 : 80, // Altura mínima responsiva
    },
    // Estilo de cada item de navegación
    navItem: {
        alignItems: 'center',       // Centra horizontalmente
        justifyContent: 'center',   // Centra verticalmente
        padding: isSmallDevice ? 6 : 8, // Padding interno responsivo
        minWidth: isSmallDevice ? 40 : 44, // Ancho mínimo responsivo
        minHeight: isSmallDevice ? 40 : 44, // Alto mínimo responsivo
        borderRadius: isSmallDevice ? 20 : 22, // Bordes redondeados
    },
});