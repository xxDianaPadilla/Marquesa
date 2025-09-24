// frontendMovil/src/screens/DiscountCodesScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRuletaMobile } from '../hooks/useRuletaMobile';
import DiscountCodeCard from '../components/DiscountCodeCard';

// Importar imágenes
import backIcon from '../images/backIcon.png';

/**
 * Pantalla para mostrar todos los códigos de descuento del usuario
 * Separada del perfil como en la estructura móvil
 */
export default function DiscountCodesScreen({ navigation }) {
    const { isAuthenticated, loading } = useAuth();
    
    // Estados para manejo de códigos
    const [userCodes, setUserCodes] = useState([]);
    const [loadingCodes, setLoadingCodes] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'used', 'expired'

    // Hook para obtener códigos del usuario
    const {
        getUserCodes,
        copyToClipboard
    } = useRuletaMobile();

    /**
     * Función para obtener códigos del usuario
     */
    const fetchUserCodes = async (showLoader = true) => {
        if (!isAuthenticated) return;

        try {
            if (showLoader) {
                setLoadingCodes(true);
            }
            
            const result = await getUserCodes();

            if (result.success) {
                console.log('✅ Códigos obtenidos:', result.codes?.length || 0);
                setUserCodes(result.codes || []);
            } else {
                console.error('❌ Error al obtener códigos:', result.reason);
                Alert.alert('Error', result.reason || 'Error al cargar códigos');
            }

        } catch (error) {
            console.error('❌ Error de conexión al obtener códigos:', error);
            Alert.alert('Error', 'Error de conexión al cargar códigos');
        } finally {
            if (showLoader) {
                setLoadingCodes(false);
            }
        }
    };

    /**
     * Maneja el pull-to-refresh
     */
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserCodes(false);
        setRefreshing(false);
    };

    /**
     * Maneja la copia de código con feedback
     */
    const handleCopyCode = async (code) => {
        const success = await copyToClipboard(code);
        if (success) {
            Alert.alert('¡Copiado!', 'Código copiado al portapapeles');
        } else {
            Alert.alert('Error', 'No se pudo copiar el código');
        }
    };

    /**
     * Maneja la navegación hacia atrás
     */
    const handleBackPress = () => {
        navigation.goBack();
    };

    /**
     * Navegar a la ruleta
     */
    const goToRuleta = () => {
        navigation.navigate('Ruleta');
    };

    /**
     * Filtrar códigos según el filtro seleccionado
     */
    const getFilteredCodes = () => {
        if (filter === 'all') return userCodes;
        return userCodes.filter(code => code.status === filter);
    };

    /**
     * Obtener conteo de códigos por estado
     */
    const getCodesCounts = () => {
        const all = userCodes.length;
        const active = userCodes.filter(code => code.status === 'active').length;
        const used = userCodes.filter(code => code.status === 'used').length;
        const expired = userCodes.filter(code => code.status === 'expired').length;
        
        return { all, active, used, expired };
    };

    /**
     * Renderizar botón de filtro
     */
    const FilterButton = ({ filterType, label, count, isActive }) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                isActive && styles.filterButtonActive
            ]}
            onPress={() => setFilter(filterType)}
        >
            <Text style={[
                styles.filterButtonText,
                isActive && styles.filterButtonTextActive
            ]}>
                {label} ({count})
            </Text>
        </TouchableOpacity>
    );

    // Cargar códigos al montar el componente
    useEffect(() => {
        if (isAuthenticated && !loading) {
            fetchUserCodes();
        }
    }, [isAuthenticated, loading]);

    // Redirigir si no está autenticado
    if (!loading && !isAuthenticated) {
        Alert.alert(
            'Inicia Sesión',
            'Debes iniciar sesión para ver tus códigos',
            [
                { text: 'Ir a Login', onPress: () => navigation.navigate('Login') },
                { text: 'Cancelar', onPress: () => navigation.goBack() }
            ]
        );
        return null;
    }

    const filteredCodes = getFilteredCodes();
    const counts = getCodesCounts();

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackPress}
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>Mis códigos de descuento</Text>
                
                {/* Botón de actualizar */}
                <TouchableOpacity
                    onPress={() => fetchUserCodes()}
                    disabled={loadingCodes}
                    style={styles.refreshHeaderButton}
                >
                    <Text style={styles.refreshHeaderButtonText}>
                        {loadingCodes ? '🔄' : '↻'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Contenido principal */}
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#E8ACD2']}
                        tintColor="#E8ACD2"
                    />
                }
            >
                {loadingCodes && userCodes.length === 0 ? (
                    // Estado de carga inicial
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#E8ACD2" />
                        <Text style={styles.loadingText}>Cargando códigos...</Text>
                    </View>
                ) : userCodes.length > 0 ? (
                    <>
                        {/* Resumen de códigos */}
                        <View style={styles.summaryContainer}>
                            <Text style={styles.summaryTitle}>
                                Tienes {counts.all} código{counts.all !== 1 ? 's' : ''} en total
                            </Text>
                            <Text style={styles.summarySubtitle}>
                                {counts.active} activo{counts.active !== 1 ? 's' : ''} • {counts.used} usado{counts.used !== 1 ? 's' : ''} • {counts.expired} caducado{counts.expired !== 1 ? 's' : ''}
                            </Text>
                        </View>

                        {/* Filtros */}
                        <View style={styles.filtersContainer}>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.filtersScrollContent}
                            >
                                <FilterButton 
                                    filterType="all" 
                                    label="Todos" 
                                    count={counts.all}
                                    isActive={filter === 'all'}
                                />
                                <FilterButton 
                                    filterType="active" 
                                    label="Activos" 
                                    count={counts.active}
                                    isActive={filter === 'active'}
                                />
                                <FilterButton 
                                    filterType="used" 
                                    label="Usados" 
                                    count={counts.used}
                                    isActive={filter === 'used'}
                                />
                                <FilterButton 
                                    filterType="expired" 
                                    label="Caducados" 
                                    count={counts.expired}
                                    isActive={filter === 'expired'}
                                />
                            </ScrollView>
                        </View>

                        {/* Lista de códigos filtrados */}
                        <View style={styles.codesContainer}>
                            {filteredCodes.length > 0 ? (
                                filteredCodes.map((code, index) => (
                                    <DiscountCodeCard
                                        key={code.codeId || index}
                                        code={code}
                                        onCopy={handleCopyCode}
                                        onPress={(selectedCode) => {
                                            console.log('Código seleccionado:', selectedCode);
                                            // Aquí podrías abrir un modal de detalles si lo deseas
                                        }}
                                    />
                                ))
                            ) : (
                                <View style={styles.emptyFilterContainer}>
                                    <Text style={styles.emptyFilterText}>
                                        No tienes códigos {filter === 'all' ? '' : filter === 'active' ? 'activos' : filter === 'used' ? 'usados' : 'caducados'}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Información adicional */}
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoTitle}>💡 Consejos útiles</Text>
                            <Text style={styles.infoText}>
                                • Puedes tener máximo 10 códigos activos al mismo tiempo
                            </Text>
                            <Text style={styles.infoText}>
                                • Los códigos caducan automáticamente después de su fecha límite
                            </Text>
                            <Text style={styles.infoText}>
                                • Toca cualquier código activo para copiarlo al portapapeles
                            </Text>
                        </View>
                    </>
                ) : (
                    // Estado vacío
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🎰</Text>
                        <Text style={styles.emptyTitle}>
                            ¡Aún no tienes códigos de descuento!
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            Visita la ruleta para obtener descuentos exclusivos y comienza a ahorrar en tus compras.
                        </Text>
                        
                        <TouchableOpacity
                            style={styles.ruletaButton}
                            onPress={goToRuleta}
                        >
                            <Text style={styles.ruletaButtonText}>
                                Ir a la ruleta
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 24,
        height: 24,
    },
    backIcon: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#333333',
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 16,
    },
    refreshHeaderButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshHeaderButtonText: {
        fontSize: 16,
        color: '#6B7280',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
        marginTop: 16,
    },
    summaryContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#E8ACD2',
    },
    summaryTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#1F2937',
        marginBottom: 8,
    },
    summarySubtitle: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
    },
    filtersContainer: {
        marginBottom: 24,
    },
    filtersScrollContent: {
        paddingRight: 20,
        gap: 12,
    },
    filterButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterButtonActive: {
        backgroundColor: '#E8ACD2',
        borderColor: '#E8ACD2',
    },
    filterButtonText: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#374151',
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
    },
    codesContainer: {
        marginBottom: 24,
    },
    emptyFilterContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyFilterText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
        textAlign: 'center',
    },
    infoContainer: {
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 40,
    },
    infoTitle: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#1E40AF',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#1E40AF',
        marginBottom: 8,
        lineHeight: 20,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 16,
    },
    emptySubtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    ruletaButton: {
        backgroundColor: '#E8ACD2',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    ruletaButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
    },
});