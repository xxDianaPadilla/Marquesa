// Importamos React y el hook useState para manejar el estado local del componente
import React, { useState } from "react";
// Importamos los componentes nativos de React Native que vamos a utilizar
import {
    View,           // Contenedor básico equivalente a un div
    TouchableOpacity, // Botón táctil que detecta toques
    Image,          // Componente para mostrar imágenes
    StyleSheet,     // Para crear estilos CSS-like
    Text,           // Componente para mostrar texto
    TextInput,      // Campo de entrada de texto
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

// Obtenemos el ancho de la pantalla del dispositivo
const { width: screenWidth } = Dimensions.get('window');

// Definimos el componente funcional HomeScreen que recibe navigation como prop
export default function HomeScreen({ navigation }) {
    // Obtenemos datos del usuario y userInfo del contexto de autenticación
    const { user, userInfo } = useAuth();
    // Obtenemos la lista de productos y el estado de carga del hook personalizado
    const { productos, loading } = useFetchProducts();
    // Estado local para manejar el texto de búsqueda
    const [searchText, setSearchText] = useState('');
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

    // Filtramos los productos basado en el texto de búsqueda y la categoría seleccionada
    const filteredProducts = productos.filter(product => {
        // Verificamos si el nombre del producto contiene el texto de búsqueda (case insensitive)
        const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
        // Verificamos si la categoría coincide ('Todo' muestra todos, sino filtra por categoría)
        const matchesCategory = selectedCategory === 'Todo' ||
            product.category?.toLowerCase().includes(selectedCategory.toLowerCase());
        // Retornamos true solo si ambas condiciones se cumplen
        return matchesSearch && matchesCategory;
    });

    // Función que renderiza cada producto en la FlatList
    const renderProduct = ({ item, index }) => (
        // Wrapper para cada card con estilos y margin condicional
        <View style={[styles.cardWrapper, { marginRight: index % 2 === 0 ? 8 : 0 }]}>
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
                    <Icon name="tune" size={20} color="#999" />
                </TouchableOpacity>
                {/* Contenedor de la barra de búsqueda */}
                <View style={styles.searchContainer}>
                    {/* Campo de texto para búsqueda */}
                    <TextInput
                        style={styles.searchInput}
                        placeholder="¿Qué estás buscando?"
                        value={searchText}              // Valor controlado por el estado
                        onChangeText={setSearchText}    // Actualiza el estado al escribir
                        placeholderTextColor="#999"
                    />
                    {/* Botón de búsqueda (ícono de lupa) */}
                    <TouchableOpacity style={styles.searchButton}>
                        <Icon name="search" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Contenedor para el scroll horizontal de categorías */}
            <View style={styles.categoryScrollContainer}>
                {/* ScrollView horizontal para las categorías */}
                <ScrollView
                    horizontal                          // Hace el scroll horizontal
                    showsHorizontalScrollIndicator={false} // Oculta la barra de scroll
                    contentContainerStyle={styles.categoryContainer} // Estilos del contenido
                    style={styles.categoryScrollView}   // Estilos del ScrollView
                    contentInset={{ right: 30 }}        // Padding adicional para iOS
                    contentInsetAdjustmentBehavior="automatic" // Ajuste automático en iOS
                >
                    // Mapeamos cada categoría para crear los botones
                    {categories.map((category) => (
                        // Botón táctil para cada categoría
                        <TouchableOpacity
                            key={category}              // Key única para React
                            style={[
                                styles.categoryButton,  // Estilo base del botón
                                // Si la categoría está seleccionada, aplica estilo activo
                                selectedCategory === category && styles.categoryButtonActive
                            ]}
                            onPress={() => setSelectedCategory(category)} // Cambia la categoría seleccionada
                        >
                            {/* Texto de la categoría */}
                            <Text
                                style={[
                                    styles.categoryText, // Estilo base del texto
                                    // Si está seleccionada, aplica estilo de texto activo
                                    selectedCategory === category && styles.categoryTextActive
                                ]}
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
            />

            {/* Barra de navegación inferior fija */}
            <View style={styles.bottomNav}>
                {/* Botón de Home (activo) */}
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="home" size={24} color="#ff6b8a" />
                </TouchableOpacity>
                {/* Botón de Favoritos (inactivo) */}
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="favorite-border" size={24} color="#ccc" />
                </TouchableOpacity>
                {/* Botón de Chat (inactivo) */}
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="chat-bubble-outline" size={24} color="#ccc" />
                </TouchableOpacity>
                {/* Botón de Carrito (inactivo) */}
                <TouchableOpacity style={styles.navItem}>
                    <Icon name="shopping-cart" size={24} color="#ccc" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Definición de estilos usando StyleSheet
const styles = StyleSheet.create({
    // Contenedor principal de toda la pantalla
    container: {
        flex: 1,                    // Ocupa todo el espacio disponible
        backgroundColor: "#ffffffff", // Fondo blanco
        paddingTop: 50,             // Padding superior para evitar notch/status bar
    },
    // Contenedor del header
    header: {
        flexDirection: 'row',       // Elementos en fila horizontal
        justifyContent: 'flex-end', // Alinea contenido a la derecha
        alignItems: 'center',       // Centra verticalmente
        paddingHorizontal: 20,      // Padding horizontal de 20px
        marginBottom: 20,           // Margen inferior de 20px
    },
    // Estilo del botón de perfil
    profileButton: {
        width: 30,                  // Ancho de 30px
        height: 30,                 // Alto de 30px
    },
    // Estilo del ícono dentro del botón
    icon: {
        width: "100%",              // Ancho al 100% del contenedor
        height: "100%",             // Alto al 100% del contenedor
        resizeMode: "contain",      // Mantiene proporciones de la imagen
    },
    // Contenedor del título principal
    titleContainer: {
        paddingHorizontal: 20,      // Padding horizontal de 20px
        marginBottom: 30,           // Margen inferior de 30px
    },
    // Estilo del texto del título principal
    mainTitle: {
        fontSize: 28,               // Tamaño de fuente 28px
        fontFamily: 'Poppins-Bold', // Fuente Poppins en negrita
        color: '#333',              // Color gris oscuro
        lineHeight: 34,             // Altura de línea de 34px
    },
    // Contenedor wrapper de la búsqueda
    searchWrapper: {
        flexDirection: 'row',       // Elementos en fila
        alignItems: 'center',       // Centra verticalmente
        marginHorizontal: 20,       // Margen horizontal de 20px
        marginBottom: 20,           // Margen inferior de 20px
        gap: 12,                    // Espacio entre elementos de 12px
    },
    // Botón de filtros (ícono tune)
    filterIconButton: {
        width: 50,                  // Ancho de 50px
        height: 50,                 // Alto de 50px
        borderRadius: 15,           // Bordes redondeados de 15px
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
        maxWidth: 500,              // Ancho máximo de 500px
        shadowColor: '#000',        // Color de sombra
        shadowOffset: {             // Offset de sombra
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.1,         // Opacidad de sombra
        shadowRadius: 4,            // Radio de sombra
        elevation: 3,               // Elevación para Android
    },
    // Campo de entrada de texto
    searchInput: {
        fontSize: 12,               // Tamaño de fuente pequeño
        fontFamily: 'Poppins-Regular', // Fuente Poppins regular
        color: '#333',              // Color de texto
        paddingVertical: 15,        // Padding vertical
        paddingLeft: 15,            // Padding izquierdo
        paddingRight: 50,           // Padding derecho (espacio para el botón)
        borderWidth: 1,             // Borde de 1px
        borderColor: '#e5e7eb',     // Color de borde gris claro
        borderRadius: 25,           // Bordes redondeados
        backgroundColor: '#fff',     // Fondo blanco
    },
    // Botón de búsqueda (lupa)
    searchButton: {
        position: 'absolute',       // Posicionamiento absoluto
        right: 0,                   // Pegado al borde derecho
        top: 0,                     // Pegado al borde superior
        bottom: 0,                  // Pegado al borde inferior
        width: 55,                  // Ancho de 55px
        height: '98%',              // Alto al 98% para dejar un pequeño margen
        backgroundColor: '#f5c7e6ff', // Fondo rosado
        borderTopLeftRadius: 0,     // Sin redondeo superior izquierdo
        borderBottomLeftRadius: 30, // Redondeo inferior izquierdo
        borderTopRightRadius: 30,   // Redondeo superior derecho
        borderBottomRightRadius: 30, // Redondeo inferior derecho
        justifyContent: 'center',   // Centra contenido horizontalmente
        alignItems: 'center',       // Centra contenido verticalmente
        overflow: 'hidden',         // Oculta contenido que se desborde
    },

    // Contenedor del scroll de categorías
    categoryScrollContainer: {
        marginBottom: 20,           // Margen inferior
    },
    // Estilos del ScrollView de categorías
    categoryScrollView: {
        flexGrow: 0,                // No crece más allá de su contenido
        overflow: 'visible',        // Hace visible el contenido que se desborda
    },
    // Contenedor del contenido de categorías
    categoryContainer: {
        paddingHorizontal: 20,      // Padding horizontal
        paddingRight: 40,           // Padding adicional a la derecha
    },
    // Estilo de cada botón de categoría
    categoryButton: {
        paddingHorizontal: 20,      // Padding horizontal interno
        paddingVertical: 8,         // Padding vertical interno
        borderRadius: 20,           // Bordes muy redondeados
        backgroundColor: '#fff',     // Fondo blanco
        marginRight: 12,            // Margen derecho entre botones
        shadowColor: '#000',        // Color de sombra
        shadowOffset: {             // Offset de sombra
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,         // Opacidad de sombra
        shadowRadius: 2,            // Radio de sombra
        elevation: 2,               // Elevación para Android
    },
    // Estilo del botón de categoría cuando está activo
    categoryButtonActive: {
        backgroundColor: '#4A4170',  // Fondo morado cuando está seleccionado
    },
    // Estilo del texto de categoría
    categoryText: {
        fontSize: 14,               // Tamaño de fuente
        fontFamily: 'Poppins-Medium', // Fuente Poppins medium
        color: '#1b1b1bff',         // Color de texto gris oscuro
    },
    // Estilo del texto cuando la categoría está activa
    categoryTextActive: {
        color: '#FFFFFF',           // Color blanco para contraste con fondo morado
    },
    // Contenedor de la lista de productos
    productsContainer: {
        paddingHorizontal: 20,      // Padding horizontal
        paddingTop: 10,             // Padding superior para separar de categorías
        paddingBottom: 100,         // Padding inferior para dejar espacio al bottom nav
    },
    // Estilo de cada fila en el grid
    row: {
        justifyContent: 'space-between', // Distribuye espacio entre columnas
        marginBottom: 16,           // Margen inferior entre filas
    },
    // Wrapper de cada card de producto
    cardWrapper: {
        // Ancho calculado: ancho de pantalla menos 48px (20+20 padding + 8 gap) dividido entre 2
        width: (screenWidth - 48) / 2,
    },
    // Barra de navegación inferior
    bottomNav: {
        position: 'absolute',       // Posición fija
        bottom: 0,                  // Pegada al fondo
        left: 0,                    // Pegada a la izquierda
        right: 0,                   // Pegada a la derecha
        flexDirection: 'row',       // Elementos en fila
        backgroundColor: '#fff',     // Fondo blanco
        paddingVertical: 16,        // Padding vertical
        paddingHorizontal: 20,      // Padding horizontal
        justifyContent: 'space-around', // Distribuye elementos uniformemente
        shadowColor: '#000',        // Color de sombra
        shadowOffset: {             // Sombra hacia arriba
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,         // Opacidad de sombra
        shadowRadius: 4,            // Radio de sombra
        elevation: 5,               // Elevación alta para Android
    },
    // Estilo de cada item de navegación
    navItem: {
        alignItems: 'center',       // Centra horizontalmente
        justifyContent: 'center',   // Centra verticalmente
        padding: 8,                 // Padding interno
    },
});