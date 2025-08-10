// Importa React y el hook useState para manejar estados locales
import React, { useState } from 'react';

// Importa componentes básicos de React Native
import {
    View,              // Contenedor para organizar elementos
    Text,              // Para mostrar texto
    Modal,             // Componente modal de pantalla completa
    TouchableOpacity,  // Botón táctil
    Dimensions,        // Para obtener dimensiones de la pantalla
    StyleSheet,        // Para definir estilos
} from 'react-native';

// Importa el slider para seleccionar valores numéricos arrastrando
import Slider from '@react-native-community/slider';

// Importa íconos de MaterialIcons
import Icon from 'react-native-vector-icons/MaterialIcons';

// Obtiene el ancho de la pantalla
const { width: screenWidth } = Dimensions.get('window');

// Verifica si el dispositivo es pequeño (menos de 375px de ancho)
const isSmallDevice = screenWidth < 375;

// Verifica si el dispositivo es mediano (entre 375px y 414px)
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;

// Componente PriceFilterModal: modal para filtrar productos por rango de precios
const PriceFilterModal = ({
    visible,               // Estado: si el modal está visible
    onClose,               // Función para cerrar el modal
    onApplyFilter,         // Función para aplicar el filtro de precios
    minPrice = 0,          // Precio mínimo permitido
    maxPrice = 100,        // Precio máximo permitido (cambiado de 1000 a 100)
    currentMinPrice = 0,   // Precio mínimo actual seleccionado
    currentMaxPrice = 100  // Precio máximo actual seleccionado (cambiado de 1000 a 100)
}) => {
    // Estado temporal para el precio mínimo mientras se ajusta el slider
    const [tempMinPrice, setTempMinPrice] = useState(currentMinPrice);

    // Estado temporal para el precio máximo mientras se ajusta el slider
    const [tempMaxPrice, setTempMaxPrice] = useState(currentMaxPrice);

    // Aplica los filtros seleccionados y cierra el modal
    const handleApplyFilters = () => {
        onApplyFilter(tempMinPrice, tempMaxPrice);
        onClose();
    };

    // Restablece los valores a los precios mínimo y máximo iniciales
    const handleReset = () => {
        setTempMinPrice(minPrice);
        setTempMaxPrice(maxPrice);
    };

    // Formatea el precio como texto en dólares con separador de miles
    const formatPrice = (price) => {
        return `$${Math.round(price).toLocaleString()}`;
    };

    // Maneja cambios en el precio mínimo con validación
    const handleMinPriceChange = (value) => {
        // Asegura que el mínimo no sobrepase el máximo - 1
        const newValue = Math.min(value, tempMaxPrice - 1);
        setTempMinPrice(newValue);
    };

    // Maneja cambios en el precio máximo con validación
    const handleMaxPriceChange = (value) => {
        // Asegura que el máximo sea al menos el mínimo + 1
        const newValue = Math.max(value, tempMinPrice + 1);
        setTempMaxPrice(newValue);
    };

    return (
        <Modal
            animationType="slide"  // Animación de entrada
            transparent={true}     // Fondo transparente
            visible={visible}      // Controla la visibilidad
            onRequestClose={onClose} // Cierra el modal en Android con botón atrás
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>

                    {/* Encabezado del modal */}
                    <View style={styles.modalHeader}>
                        {/* Línea decorativa */}
                        <View style={styles.headerLine} />
                        <View style={styles.headerTop}>
                            {/* Título */}
                            <Text style={styles.modalTitle}>Rango de precios</Text>
                            {/* Botón para cerrar */}
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Cuerpo del modal */}
                    <View style={styles.modalBody}>
                        
                        {/* Texto que muestra el rango actual */}
                        <View style={styles.priceRangeDisplay}>
                            <Text style={styles.priceLabel}>Rango seleccionado:</Text>
                            <Text style={styles.priceRange}>
                                {formatPrice(tempMinPrice)} - {formatPrice(tempMaxPrice)}
                            </Text>
                        </View>

                        {/* Slider para el precio mínimo */}
                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>
                                Precio mínimo: {formatPrice(tempMinPrice)}
                            </Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={minPrice}     // Valor mínimo permitido
                                maximumValue={maxPrice}     // Valor máximo permitido
                                value={tempMinPrice}        // Valor actual
                                onValueChange={handleMinPriceChange} // Función al mover
                                step={1}                    // Precisión de 1 en 1
                                minimumTrackTintColor="#f5c7e6" // Color barra activa
                                maximumTrackTintColor="#e0e0e0" // Color barra inactiva
                                thumbStyle={styles.sliderThumb}   // Estilo del pulgar
                            />
                        </View>

                        {/* Slider para el precio máximo */}
                        <View style={styles.sliderContainer}>
                            <Text style={styles.sliderLabel}>
                                Precio máximo: {formatPrice(tempMaxPrice)}
                            </Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={minPrice}
                                maximumValue={maxPrice}
                                value={tempMaxPrice}
                                onValueChange={handleMaxPriceChange}
                                step={1}
                                minimumTrackTintColor="#f5c7e6"
                                maximumTrackTintColor="#e0e0e0"
                                thumbStyle={styles.sliderThumb}
                            />
                        </View>

                        {/* Botones de acción */}
                        <View style={styles.buttonContainer}>
                            {/* Botón de restablecer */}
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={handleReset}
                            >
                                <Text style={styles.resetButtonText}>Restablecer</Text>
                            </TouchableOpacity>

                            {/* Botón de aplicar filtros */}
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={handleApplyFilters}
                            >
                                <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Estilos del modal
const styles = StyleSheet.create({
    modalOverlay: { // Fondo oscuro semitransparente
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: { // Contenedor principal del modal
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '72%',   // Altura del modal
        minHeight: '65%',
    },
    modalHeader: { // Encabezado
        paddingTop: 8,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerLine: { // Línea decorativa
        width: 40,
        height: 3,
        backgroundColor: '#d9d9d9ff',
        alignSelf: 'center',
        borderRadius: 2,
        marginBottom: 16,
    },
    headerTop: { // Contenedor de título y botón de cerrar
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalTitle: { // Estilo del título
        fontSize: isSmallDevice ? 18 : 20,
        fontFamily: 'Poppins-SemiBold',
        color: '#000000',
    },
    closeButton: { // Botón de cerrar
        padding: 4,
    },
    modalBody: { // Cuerpo del modal
        flex: 1,
        padding: 20,
        paddingBottom: 120,
    },
    priceRangeDisplay: { // Caja con el rango actual
        alignItems: 'center',
        marginBottom: 30,
        paddingVertical: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
    },
    priceLabel: { // Texto "Rango seleccionado"
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666',
        marginBottom: 8,
    },
    priceRange: { // Texto con los valores del rango
        fontSize: isSmallDevice ? 18 : 20,
        fontFamily: 'Poppins-Bold',
        color: '#000000ff',
    },
    sliderContainer: { // Contenedor del slider
        marginBottom: 30,
    },
    sliderLabel: { // Texto sobre el slider
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#333',
        marginBottom: 12,
    },
    slider: { // Estilo del slider
        width: '100%',
        height: 40,
    },
    sliderThumb: { // Estilo del pulgar del slider
        backgroundColor: '#f5c7e6',
        width: 20,
        height: 20,
    },
    buttonContainer: { // Contenedor de botones
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20,
        gap: 12,
    },
    resetButton: { // Botón "Restablecer"
        flex: 1,
        paddingVertical: 14,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    resetButtonText: { // Texto del botón "Restablecer"
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#666',
    },
    applyButton: { // Botón "Aplicar filtros"
        flex: 1,
        paddingVertical: 14,
        borderRadius: 25,
        backgroundColor: '#f5c7e6ff',
        alignItems: 'center',
    },
    applyButtonText: { // Texto del botón "Aplicar filtros"
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#fff',
    },
    bottomNav: { // Barra inferior (si se usara)
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: isSmallDevice ? 12 : 16,
        paddingHorizontal: 20,
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    navItem: { // Ítems de la barra inferior
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
});

// Exporta el componente para usarlo en otras partes de la app
export default PriceFilterModal;
