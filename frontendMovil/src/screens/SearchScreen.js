// Importamos React y los hooks necesarios
import React, { useState, useEffect, useRef } from 'react';
// Importamos todos los componentes necesarios de React Native
import {
    View,          // Contenedor básico equivalente a div
    TextInput,     // Campo de texto para búsqueda
    TouchableOpacity, // Botón táctil con feedback
    Text,          // Componente para mostrar texto
    FlatList,      // Lista optimizada para grandes conjuntos de datos
    StyleSheet,    // Para crear estilos CSS-like
    Dimensions,    // Para obtener dimensiones de la pantalla
    SafeAreaView,  // Vista que respeta el área segura del dispositivo
    Keyboard,      // API para controlar el teclado
    Alert          // Para mostrar alertas nativas
} from 'react-native';
// Importamos librería de iconos Material Design
import Icon from 'react-native-vector-icons/MaterialIcons';
// Importamos nuestros hooks personalizados
import { useSearchHistory } from '../hooks/useSearchHistory';
import useFetchProducts from '../hooks/useFetchProducts';
// Importamos el componente de tarjeta de producto
import ProductCard from '../components/Products/ProductCard';

// Obtenemos el ancho de la pantalla del dispositivo
const { width: screenWidth } = Dimensions.get('window');
// Determinamos si es un dispositivo pequeño (menos de 375px de ancho)
const isSmallDevice = screenWidth < 375;
// Determinamos si es un dispositivo mediano (entre 375 y 414px)
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
// Padding horizontal adaptativo según el tamaño de pantalla
const horizontalPadding = isSmallDevice ? 16 : isMediumDevice ? 20 : 24;
// Espaciado entre elementos adaptativo
const elementGap = isSmallDevice ? 8 : isMediumDevice ? 10 : 12;

// Componente principal de la pantalla de búsqueda
export default function SearchScreen({ navigation }) {
    // === ESTADOS LOCALES ===
    // Estado para el texto de búsqueda actual
    const [searchText, setSearchText] = useState('');
    // Estado para controlar si mostramos resultados o historial
    const [showResults, setShowResults] = useState(false);
    // Estado para almacenar los productos filtrados
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    // === HOOKS PERSONALIZADOS ===
    // Hook para obtener la lista de productos
    const { productos } = useFetchProducts();
    // Hook para manejar el historial de búsquedas
    const { 
        searchHistory,      // Array con las búsquedas previas
        addSearchTerm,      // Función para agregar nueva búsqueda
        removeSearchTerm,   // Función para eliminar búsqueda específica
        clearSearchHistory  // Función para limpiar todo el historial
    } = useSearchHistory();
    
    // === REFERENCIAS ===
    // Referencia al input de búsqueda para controlarlo programáticamente
    const searchInputRef = useRef(null);

    // === EFECTOS ===
    // Auto-focus al cargar la pantalla
    useEffect(() => {
        // Creamos un timer para enfocar el input después de 300ms
        const timer = setTimeout(() => {
            // Enfocamos el input si existe la referencia
            searchInputRef.current?.focus();
        }, 300);
        // Limpiamos el timer si el componente se desmonta
        return () => clearTimeout(timer);
    }, []); // Array vacío = solo se ejecuta al montar el componente

    // Filtrar productos cuando cambia el texto de búsqueda
    useEffect(() => {
        // Si hay texto de búsqueda (no vacío después del trim)
        if (searchText.trim().length > 0) {
            // Filtramos productos que coincidan con la búsqueda
            const filtered = productos.filter(product =>
                // Buscamos en el nombre (case-insensitive)
                product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                // Buscamos en la categoría si existe
                product.category?.toLowerCase().includes(searchText.toLowerCase()) ||
                // Buscamos en la descripción si existe
                product.description?.toLowerCase().includes(searchText.toLowerCase())
            );
            // Actualizamos el estado con los productos filtrados
            setFilteredProducts(filtered);
            // Mostramos la sección de resultados
            setShowResults(true);
        } else {
            // Si no hay texto, limpiamos los resultados
            setFilteredProducts([]);
            // Ocultamos la sección de resultados (mostramos historial)
            setShowResults(false);
        }
    }, [searchText, productos]); // Se ejecuta cuando cambia el texto o los productos

    // === FUNCIONES DE MANEJO ===
    // Función para realizar búsqueda
    const handleSearch = () => {
        // Verificamos que haya texto para buscar
        if (searchText.trim()) {
            // Agregamos el término al historial
            addSearchTerm(searchText.trim());
            // Ocultamos el teclado
            Keyboard.dismiss();
        }
    };

    // Función para seleccionar un término del historial
    const handleHistorySelect = (term) => {
        // Establecemos el término seleccionado como texto de búsqueda
        setSearchText(term);
        // Lo agregamos al historial (moverá al inicio)
        addSearchTerm(term);
        // Quitamos el focus del input para mostrar resultados mejor
        searchInputRef.current?.blur();
    };

    // Función para navegar al detalle del producto
    const handleProductPress = (product) => {
        // Navegamos a la pantalla de detalle pasando el ID del producto
        navigation.navigate('ProductDetail', { productId: product._id });
    };

    // Función para agregar producto al carrito
    const handleAddToCart = (product) => {
        // Por ahora solo logueamos, aquí iría la lógica del carrito
        console.log('Agregar al carrito:', product);
        // Aquí puedes agregar tu lógica del carrito
    };

    // Función para toggle de favoritos
    const handleToggleFavorite = (product) => {
        // Por ahora solo logueamos, aquí iría la lógica de favoritos
        console.log('Toggle favorito:', product);
        // Aquí puedes agregar tu lógica de favoritos
    };

    // Función para volver a la pantalla anterior
    const handleGoBack = () => {
        // Utilizamos la función goBack del navigation prop
        navigation.goBack();
    };

    // Función para limpiar la búsqueda actual
    const handleClearSearch = () => {
        // Limpiamos el texto de búsqueda
        setSearchText('');
        // Ocultamos los resultados (volvemos al historial)
        setShowResults(false);
        // Enfocamos nuevamente el input
        searchInputRef.current?.focus();
    };

    // Función que maneja el botón dinámico (buscar o limpiar)
    const handleDynamicButtonPress = () => {
        // Si hay texto, limpiamos la búsqueda
        if (searchText.trim().length > 0) {
            handleClearSearch();
        } else {
            // Si no hay texto, ejecutamos búsqueda (aunque esté vacía)
            handleSearch();
        }
    };

    // === FUNCIONES DE RENDERIZADO ===
    // Función para renderizar cada item del historial
    const renderHistoryItem = ({ item }) => (
        // Contenedor principal del item
        <View style={styles.historyItem}>
            {/* Botón principal del item (texto + ícono) */}
            <TouchableOpacity 
                style={styles.historyItemContent}
                onPress={() => handleHistorySelect(item)}
            >
                {/* Ícono de historial */}
                <Icon name="history" size={20} color="#999" />
                {/* Texto del término de búsqueda */}
                <Text style={styles.historyText}>{item}</Text>
            </TouchableOpacity>
            {/* Botón para eliminar este item del historial */}
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeSearchTerm(item)}
            >
                {/* Ícono de cerrar/eliminar */}
                <Icon name="close" size={18} color="#ccc" />
            </TouchableOpacity>
        </View>
    );

    // Función para renderizar cada producto en la grilla
    const renderProduct = ({ item, index }) => (
        // Wrapper con margin condicional para la grilla de 2 columnas
        <View style={[styles.cardWrapper, { 
            // Solo agregamos margen derecho a los items de la columna izquierda (índices pares)
            marginRight: index % 2 === 0 ? elementGap : 0 
        }]}>
            {/* Componente ProductCard con todas las props necesarias */}
            <ProductCard
                product={item}                    // Datos del producto
                onPress={handleProductPress}      // Función cuando se presiona el producto
                onAddToCart={handleAddToCart}     // Función para agregar al carrito
                onToggleFavorite={handleToggleFavorite} // Función para favoritos
                isFavorite={false}               // Estado de favorito (hardcoded por ahora)
            />
        </View>
    );

    // === RENDERIZADO PRINCIPAL ===
    return (
        // Vista principal que respeta el área segura del dispositivo
        <SafeAreaView style={styles.container}>
            {/* === HEADER CON BÚSQUEDA === */}
            <View style={styles.header}>
                {/* Botón para volver atrás */}
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleGoBack}
                >
                    <Icon name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                
                {/* Contenedor del input de búsqueda */}
                <View style={styles.searchContainer}>
                    {/* Campo de texto para búsqueda */}
                    <TextInput
                        ref={searchInputRef}                    // Referencia para control programático
                        style={styles.searchInput}              // Estilos del input
                        placeholder="¿Qué estás buscando?"      // Texto de placeholder
                        value={searchText}                      // Valor controlado
                        onChangeText={setSearchText}            // Función cuando cambia el texto
                        onSubmitEditing={handleSearch}          // Función cuando se presiona Enter
                        placeholderTextColor="#999"             // Color del placeholder
                        returnKeyType="search"                  // Tipo de tecla Enter (lupa)
                        autoCorrect={false}                     // Deshabilitamos corrección automática
                        autoCapitalize="none"                   // Sin capitalización automática
                    />
                    
                    {/* Botón dinámico: X cuando hay texto, lupa cuando no hay */}
                    <TouchableOpacity 
                        style={styles.searchButton}
                        onPress={handleDynamicButtonPress}
                    >
                        {/* Ícono condicional basado en si hay texto */}
                        <Icon 
                            name={searchText.trim().length > 0 ? "close" : "search"} 
                            size={20} 
                            color="#fff" 
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* === CONTENIDO PRINCIPAL === */}
            <View style={styles.content}>
                {/* Condicional: mostrar historial o resultados */}
                {!showResults ? (
                    /* === SECCIÓN DE HISTORIAL === */
                    <View style={styles.historySection}>
                        {/* Header de la sección historial */}
                        <View style={styles.historySectionHeader}>
                            {/* Título de la sección */}
                            <Text style={styles.historySectionTitle}>
                                Búsquedas recientes
                            </Text>
                            {/* Botón "Limpiar todo" (solo si hay historial) */}
                            {searchHistory.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => 
                                        // Mostramos alert de confirmación
                                        Alert.alert(
                                            'Limpiar historial',                    // Título
                                            '¿Estás seguro de que deseas eliminar todo el historial?', // Mensaje
                                            [
                                                { text: 'Cancelar', style: 'cancel' }, // Botón cancelar
                                                { 
                                                    text: 'Eliminar',                  // Botón confirmar
                                                    style: 'destructive',              // Estilo destructivo (rojo)
                                                    onPress: clearSearchHistory        // Función a ejecutar
                                                }
                                            ]
                                        )
                                    }
                                >
                                    <Text style={styles.clearAllText}>Limpiar todo</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        {/* Lista de historial o mensaje vacío */}
                        {searchHistory.length > 0 ? (
                            /* Lista con el historial */
                            <FlatList
                                data={searchHistory}                    // Datos a mostrar
                                renderItem={renderHistoryItem}          // Función de renderizado
                                keyExtractor={(item, index) => `${item}-${index}`} // Key única
                                showsVerticalScrollIndicator={false}    // Ocultar scroll indicator
                                contentContainerStyle={styles.historyList} // Estilos del contenedor
                            />
                        ) : (
                            /* Mensaje cuando no hay historial */
                            <View style={styles.emptyHistory}>
                                <Text style={styles.emptyHistoryText}>
                                    No hay búsquedas recientes
                                </Text>
                                <Text style={styles.emptyHistorySubtext}>
                                    Tus búsquedas aparecerán aquí
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    /* === SECCIÓN DE RESULTADOS === */
                    <View style={styles.resultsSection}>
                        {/* Título con número de resultados */}
                        <Text style={styles.resultsTitle}>
                            {/* Número de resultados encontrados */}
                            {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''} 
                            {/* Término de búsqueda si existe */}
                            {searchText.trim() && ` para "${searchText}"`}
                        </Text>
                        
                        {/* Lista de productos o mensaje vacío */}
                        {filteredProducts.length > 0 ? (
                            /* Grilla de productos */
                            <FlatList
                                data={filteredProducts}                // Productos filtrados
                                renderItem={renderProduct}             // Función de renderizado
                                keyExtractor={(item) => item._id}      // Key única usando ID del producto
                                numColumns={2}                         // 2 columnas
                                showsVerticalScrollIndicator={false}    // Ocultar scroll indicator
                                columnWrapperStyle={styles.row}        // Estilos de la fila (para numColumns > 1)
                                contentContainerStyle={styles.resultsContainer} // Estilos del contenedor
                                // Optimizaciones de rendimiento:
                                initialNumToRender={8}                 // Renderizar 8 items inicialmente
                                maxToRenderPerBatch={8}               // Máximo 8 por batch
                                windowSize={10}                       // Tamaño de ventana
                                removeClippedSubviews={true}          // Remover vistas fuera de pantalla
                            />
                        ) : (
                            /* Mensaje cuando no hay resultados */
                            <View style={styles.emptyResults}>
                                {/* Ícono de "sin resultados" */}
                                <Icon name="search-off" size={48} color="#ddd" />
                                <Text style={styles.emptyResultsText}>
                                    No encontramos productos
                                </Text>
                                <Text style={styles.emptyResultsSubtext}>
                                    Intenta con otra búsqueda
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

// === ESTILOS ===
const styles = StyleSheet.create({
    // Contenedor principal
    container: {
        flex: 1,                    // Ocupa todo el espacio disponible
        backgroundColor: '#fff',    // Fondo blanco
    },
    
    // Header con búsqueda
    header: {
        flexDirection: 'row',       // Elementos en fila
        alignItems: 'center',       // Centrados verticalmente
        paddingHorizontal: horizontalPadding, // Padding horizontal adaptativo
        paddingVertical: 12,        // Padding vertical fijo
        borderBottomWidth: 1,       // Borde inferior
        borderBottomColor: '#f0f0f0', // Color del borde
        backgroundColor: '#fff',    // Fondo blanco
        // Sombra para iOS:
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,              // Sombra para Android
    },
    
    // Botón de volver atrás
    backButton: {
        marginRight: 12,           // Espacio a la derecha
        padding: 4,                // Padding interno
        borderRadius: 20,          // Bordes redondeados
        marginTop: 30,
    },
    
    // Contenedor del input de búsqueda
    searchContainer: {
        flex: 1,                   // Ocupa el espacio restante
        position: 'relative',      // Para posicionar el botón absolutamente
        backgroundColor: '#fff',   // Fondo blanco
        borderRadius: 25,          // Bordes muy redondeados
        maxWidth: screenWidth - (horizontalPadding * 2) - 60, // Ancho máximo calculado
        // Sombra:
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 30,
    },
    
    // Input de búsqueda
    searchInput: {
        fontSize: isSmallDevice ? 12 : 14,    // Tamaño de fuente adaptativo
        fontFamily: 'Poppins-Regular',        // Fuente personalizada
        color: '#333',                        // Color del texto
        paddingVertical: isSmallDevice ? 12 : 15,  // Padding vertical adaptativo
        paddingLeft: isSmallDevice ? 12 : 15,      // Padding izquierdo adaptativo
        paddingRight: isSmallDevice ? 50 : 55,     // Padding derecho para el botón
        borderWidth: 1,                       // Ancho del borde
        borderColor: '#e5e7eb',              // Color del borde
        borderRadius: 25,                    // Bordes redondeados
        backgroundColor: '#fff',             // Fondo blanco
    },
    
    // Botón de búsqueda/limpiar
    searchButton: {
        position: 'absolute',                // Posición absoluta
        right: 1,                           // Pegado al borde derecho
        top: 1,                             // Pegado al borde superior
        bottom: 1,                          // Pegado al borde inferior
        width: isSmallDevice ? 45 : 50,     // Ancho adaptativo
        height: isSmallDevice ? 43 : 50,    // Alto adaptativo
        backgroundColor: '#f5c7e6ff',       // Color rosado
        // Bordes redondeados solo en el lado derecho:
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 23,
        borderTopRightRadius: 23,
        borderBottomRightRadius: 23,
        justifyContent: 'center',           // Centrar contenido verticalmente
        alignItems: 'center',               // Centrar contenido horizontalmente
        overflow: 'hidden',                 // Ocultar contenido que sobresalga
    },
    
    // Contenedor principal de contenido
    content: {
        flex: 1,                           // Ocupa el espacio restante
    },
    
    // === ESTILOS DEL HISTORIAL ===
    historySection: {
        flex: 1,                           // Ocupa todo el espacio
        paddingHorizontal: horizontalPadding, // Padding horizontal
        paddingTop: 20,                    // Padding superior
    },
    historySectionHeader: {
        flexDirection: 'row',              // Elementos en fila
        justifyContent: 'space-between',   // Espacio entre elementos
        alignItems: 'center',              // Centrados verticalmente
        marginBottom: 16,                  // Margen inferior
    },
    historySectionTitle: {
        fontSize: isSmallDevice ? 16 : 16, // Tamaño de fuente
        fontFamily: 'Poppins-Regular',     // Fuente
        color: '#333',                     // Color del texto
        marginTop: 20,
    },
    clearAllText: {
        fontSize: 14,                      // Tamaño de fuente
        fontFamily: 'Poppins-Medium',      // Fuente medium
        color: '#f5c7e6ff',               // Color rosado
    },
    historyList: {
        flexGrow: 1,                       // Permite que crezca
    },
    historyItem: {
        flexDirection: 'row',              // Elementos en fila
        alignItems: 'center',              // Centrados verticalmente
        justifyContent: 'space-between',   // Espacio entre elementos
        paddingVertical: 14,               // Padding vertical
        borderBottomWidth: 1,              // Borde inferior
        borderBottomColor: '#f0f0f0',     // Color del borde
    },
    historyItemContent: {
        flexDirection: 'row',              // Elementos en fila
        alignItems: 'center',              // Centrados verticalmente
        flex: 1,                          // Ocupa el espacio disponible
    },
    historyText: {
        fontSize: isSmallDevice ? 14 : 16, // Tamaño adaptativo
        fontFamily: 'Poppins-Regular',     // Fuente
        color: '#333',                     // Color del texto
        marginLeft: 12,                    // Margen izquierdo
        flex: 1,                          // Ocupa el espacio restante
    },
    removeButton: {
        padding: 8,                        // Padding interno
        borderRadius: 15,                  // Bordes redondeados
    },
    emptyHistory: {
        flex: 1,                          // Ocupa todo el espacio
        justifyContent: 'center',         // Centrado verticalmente
        alignItems: 'center',             // Centrado horizontalmente
        paddingVertical: 60,              // Padding vertical
        marginTop: -120,
    },
    emptyHistoryText: {
        fontSize: isSmallDevice ? 16 : 18, // Tamaño adaptativo
        fontFamily: 'Poppins-Medium',      // Fuente medium
        color: '#999',                     // Color gris
        marginTop: 16,                     // Margen superior
        textAlign: 'center',               // Texto centrado
    },
    emptyHistorySubtext: {
        fontSize: 14,                      // Tamaño fijo
        fontFamily: 'Poppins-Regular',     // Fuente regular
        color: '#ccc',                     // Color gris claro
        marginTop: 8,                      // Margen superior
        textAlign: 'center',               // Texto centrado
    },
    
    // === ESTILOS DE RESULTADOS ===
    resultsSection: {
        flex: 1,                          // Ocupa todo el espacio
        paddingHorizontal: horizontalPadding, // Padding horizontal
        paddingTop: 16,                   // Padding superior
    },
    resultsTitle: {
        fontSize: isSmallDevice ? 14 : 16, // Tamaño adaptativo
        fontFamily: 'Poppins-Medium',      // Fuente medium
        color: '#666',                     // Color gris
        marginBottom: 16,                  // Margen inferior
    },
    resultsContainer: {
        paddingBottom: 20,                 // Padding inferior
    },
    row: {
        justifyContent: 'space-between',   // Espacio entre columnas
        marginBottom: isSmallDevice ? 12 : 16, // Margen inferior adaptativo
        paddingHorizontal: 2,              // Padding horizontal pequeño
    },
    cardWrapper: {
        // Ancho calculado para 2 columnas con gap:
        width: (screenWidth - (horizontalPadding * 2) - elementGap - 4) / 2,
        minHeight: isSmallDevice ? 180 : 200, // Altura mínima adaptativa
    },
    emptyResults: {
        flex: 1,                          // Ocupa todo el espacio
        justifyContent: 'center',         // Centrado verticalmente
        alignItems: 'center',             // Centrado horizontalmente
        paddingVertical: 60,              // Padding vertical
    },
    emptyResultsText: {
        fontSize: isSmallDevice ? 16 : 18, // Tamaño adaptativo
        fontFamily: 'Poppins-Medium',      // Fuente medium
        color: '#999',                     // Color gris
        marginTop: 16,                     // Margen superior
        textAlign: 'center',               // Texto centrado
    },
    emptyResultsSubtext: {
        fontSize: 14,                      // Tamaño fijo
        fontFamily: 'Poppins-Regular',     // Fuente regular
        color: '#ccc',                     // Color gris claro
        marginTop: 8,                      // Margen superior
        textAlign: 'center',               // Texto centrado
    },
});