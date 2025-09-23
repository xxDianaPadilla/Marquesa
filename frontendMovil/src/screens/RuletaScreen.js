// frontendMovil/src/screens/RuletaScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRuletaMobile } from '../hooks/useRuletaMobile';
import RuletaAnimationMobile from '../components/RuletaAnimationMobile';
import ResultModalMobile from '../components/ResultModalMobile';
import DiscountCodeCard from '../components/DiscountCodeCard';

// Importar imágenes
import backIcon from '../images/backIcon.png';

/**
 * Pantalla principal de la ruleta de descuentos
 * Equivalente a RuletaPage.jsx del frontend web
 */
export default function RuletaScreen({ navigation }) {
    const { isAuthenticated, loading } = useAuth();
    
    // Estados para códigos obtenidos del usuario
    const [userCodes, setUserCodes] = useState([]);
    const [loadingCodes, setLoadingCodes] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    
    // Hook personalizado para manejar la lógica de la ruleta
    const {
        isSpinning,
        selectedCode,
        showResult,
        hasSpun,
        error,
        spinRuleta,
        resetRuleta,
        closeResult,
        copyToClipboard,
        getUserCodes,
        clearError
    } = useRuletaMobile();

    /**
     * Función para obtener los códigos del usuario desde el backend
     */
    const fetchUserCodes = async (showLoader = true) => {
        if (!isAuthenticated) return;

        try {
            if (showLoader) {
                setLoadingCodes(true);
            }
            
            const result = await getUserCodes();

            if (result.success) {
                console.log('✅ Códigos del usuario obtenidos:', result.codes);
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
     * Maneja el cierre del modal con recarga de códigos
     */
    const handleCloseResult = () => {
        closeResult();
        // Recargar códigos después de generar uno nuevo
        fetchUserCodes(false);
    };

    /**
     * Maneja el reseteo con limpieza de errores
     */
    const handleReset = () => {
        resetRuleta();
        clearError();
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
     * Navegar a la pantalla de códigos de descuento
     */
    const goToDiscountCodes = () => {
        navigation.navigate('DiscountCodes');
    };

    /**
     * Navegar a la pantalla principal (tienda)
     */
    const goToHome = () => {
        navigation.navigate('Home');
    };

    // Cargar códigos del usuario al montar el componente
    useEffect(() => {
        if (isAuthenticated && !loading) {
            fetchUserCodes();
        }
    }, [isAuthenticated, loading]);

    // Mostrar alerta de error cuando hay errores
    useEffect(() => {
        if (error) {
            Alert.alert('Atención', error, [
                { text: 'OK', onPress: clearError }
            ]);
        }
    }, [error, clearError]);

    // Redirigir a login si no está autenticado
    if (!loading && !isAuthenticated) {
        Alert.alert(
            'Inicia Sesión',
            'Debes iniciar sesión para acceder a la ruleta',
            [
                { text: 'Ir a Login', onPress: () => navigation.navigate('Login') },
                { text: 'Cancelar', onPress: () => navigation.goBack() }
            ]
        );
        return null;
    }

    return (
        <View style={styles.container}>
            {/* Header con navegación */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackPress}
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>Ruleta marquesa</Text>
                
                <View style={styles.headerRight} />
            </View>

            {/* Contenido principal con scroll */}
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
                {/* Información de autenticación */}
                {!isAuthenticated && (
                    <View style={styles.authWarning}>
                        <Text style={styles.authWarningText}>
                            Inicia sesión para obtener códigos de descuento personalizados
                        </Text>
                    </View>
                )}

                {/* Sección de la ruleta */}
                <View style={styles.ruletaSection}>
                    <RuletaAnimationMobile
                        isSpinning={isSpinning}
                        onSpin={spinRuleta}
                        hasSpun={hasSpun}
                        showResult={showResult}
                    />
                    
                    {/* Mensajes dinámicos debajo de la ruleta */}
                    <View style={styles.messageContainer}>
                        {!hasSpun && !isSpinning && (
                            <Text style={styles.readyMessage}>
                                {isAuthenticated 
                                    ? '¡Toca la ruleta para obtener tu descuento!'
                                    : 'Inicia sesión para girar la ruleta y obtener descuentos'
                                }
                            </Text>
                        )}
                        
                        {isSpinning && (
                            <Text style={styles.spinningMessage}>
                                ¡La ruleta está girando! Espera tu resultado...
                            </Text>
                        )}
                        
                        {hasSpun && !error && (
                            <View style={styles.successContainer}>
                                <Text style={styles.successMessage}>
                                    ¡Código generado exitosamente!
                                </Text>
                                <TouchableOpacity
                                    style={styles.resetButton}
                                    onPress={handleReset}
                                >
                                    <Text style={styles.resetButtonText}>
                                        Intentar de nuevo
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>

                {/* Sección de códigos obtenidos */}
                <View style={styles.codesSection}>
                    <View style={styles.codesSectionHeader}>
                        <Text style={styles.codesSectionTitle}>
                            Mis códigos recientes
                        </Text>
                        
                        {/* Botón para actualizar códigos */}
                        <TouchableOpacity
                            onPress={() => fetchUserCodes()}
                            disabled={loadingCodes}
                            style={styles.refreshButton}
                        >
                            <Text style={styles.refreshButtonText}>
                                {loadingCodes ? '🔄' : '↻'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Lista de códigos */}
                    {loadingCodes && userCodes.length === 0 ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Cargando códigos...</Text>
                        </View>
                    ) : userCodes.length > 0 ? (
                        <View style={styles.codesContainer}>
                            {/* Mostrar solo los primeros 3 códigos */}
                            {userCodes.slice(0, 3).map((code, index) => (
                                <DiscountCodeCard
                                    key={code.codeId || index}
                                    code={code}
                                    onCopy={handleCopyCode}
                                    onPress={(selectedCode) => {
                                        console.log('Código seleccionado:', selectedCode);
                                    }}
                                />
                            ))}

                            {/* Información sobre límites */}
                            <View style={styles.limitsInfo}>
                                <Text style={styles.limitsText}>
                                    Códigos activos: {userCodes.filter(c => c.status === 'active').length}/10
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyCodesContainer}>
                            <Text style={styles.emptyCodesIcon}>🎰</Text>
                            <Text style={styles.emptyCodesTitle}>
                                ¡Aún no tienes códigos!
                            </Text>
                            <Text style={styles.emptyCodesSubtitle}>
                                Gira la ruleta para obtener tu primer descuento
                            </Text>
                        </View>
                    )}

                    {/* Botón para ver códigos completos */}
                    {userCodes.length > 0 && (
                        <TouchableOpacity
                            style={styles.codesButton}
                            onPress={goToDiscountCodes}
                        >
                            <Text style={styles.codesButtonText}>
                                Ver todos mis códigos 📋
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Botón de acción principal */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={styles.primaryActionButton}
                        onPress={goToHome}
                    >
                        <Text style={styles.primaryActionButtonText}>
                            Comenzar a comprar 🛍️
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal de resultado */}
            <ResultModalMobile 
                isOpen={showResult}
                selectedCode={selectedCode}
                onClose={handleCloseResult}
                onCopyCode={copyToClipboard}
            />
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
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#333333',
        textAlign: 'center',
    },
    headerRight: {
        width: 24,
        height: 24,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    authWarning: {
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    authWarningText: {
        color: '#92400E',
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
    },
    ruletaSection: {
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 30,
    },
    messageContainer: {
        alignItems: 'center',
        minHeight: 60,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    readyMessage: {
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        color: '#374151',
        textAlign: 'center',
        lineHeight: 24,
    },
    spinningMessage: {
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        color: '#E8ACD2',
        textAlign: 'center',
        lineHeight: 24,
    },
    successContainer: {
        alignItems: 'center',
        gap: 16,
    },
    successMessage: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#059669',
        textAlign: 'center',
    },
    resetButton: {
        backgroundColor: '#E8ACD2',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    resetButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
    },
    codesSection: {
        marginBottom: 30,
    },
    codesSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    codesSectionTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#1F2937',
    },
    refreshButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    refreshButtonText: {
        fontSize: 16,
        color: '#6B7280',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
    },
    codesContainer: {
        gap: 8,
    },
    viewAllButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    viewAllButtonText: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#374151',
    },
    limitsInfo: {
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    limitsText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
    },
    emptyCodesContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyCodesIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyCodesTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        color: '#374151',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyCodesSubtitle: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#6B7280',
        textAlign: 'center',
    },
    codesButton: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    codesButtonText: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: '#374151',
    },
    actionSection: {
        marginBottom: 40,
    },
    primaryActionButton: {
        backgroundColor: '#E8ACD2',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryActionButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
    },
});