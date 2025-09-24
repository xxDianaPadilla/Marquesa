// frontendMovil/src/components/DiscountCodeCard.js
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Clipboard
} from 'react-native';

/**
 * Componente de tarjeta individual para mostrar códigos de descuento
 * Reutilizable para la lista de códigos del usuario
 */
export default function DiscountCodeCard({ 
    code, 
    onCopy, 
    onPress,
    style 
}) {
    /**
     * Formatear fecha para mostrar
     */
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            return 'Fecha no válida';
        }
    };

    /**
     * Obtener texto del estado en español
     */
    const getStatusText = (status) => {
        const statusMap = {
            'active': 'Activo',
            'used': 'Utilizado',
            'expired': 'Caducado'
        };
        return statusMap[status] || status;
    };

    /**
     * Obtener estilo del estado
     */
    const getStatusStyle = (status) => {
        const statusStyles = {
            'active': {
                backgroundColor: '#D1FAE5',
                color: '#047857'
            },
            'used': {
                backgroundColor: '#F3F4F6',
                color: '#6B7280'
            },
            'expired': {
                backgroundColor: '#FEE2E2',
                color: '#DC2626'
            }
        };
        return statusStyles[status] || statusStyles['expired'];
    };

    /**
     * Manejar copia del código
     */
    const handleCopyCode = async () => {
        try {
            await Clipboard.setString(code.code);
            console.log('📋 Código copiado:', code.code);
            
            if (onCopy) {
                onCopy(code.code);
            }
        } catch (error) {
            console.error('❌ Error al copiar código:', error);
        }
    };

    /**
     * Manejar toque en la tarjeta
     */
    const handlePress = () => {
        if (onPress) {
            onPress(code);
        }
    };

    const statusStyle = getStatusStyle(code.status);

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: code.color || '#F9FAFB' },
                style
            ]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            {/* Badge de estado */}
            <View style={styles.statusContainer}>
                <View 
                    style={[
                        styles.statusBadge,
                        { backgroundColor: statusStyle.backgroundColor }
                    ]}
                >
                    <Text 
                        style={[
                            styles.statusText,
                            { color: statusStyle.color }
                        ]}
                    >
                        {getStatusText(code.status)}
                    </Text>
                </View>
            </View>

            {/* Contenido principal */}
            <View style={styles.content}>
                {/* Nombre y descuento */}
                <View style={styles.header}>
                    <Text 
                        style={[
                            styles.codeName,
                            { color: code.textColor || '#374151' }
                        ]}
                    >
                        {code.name}
                    </Text>
                    
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>
                            {code.discount}
                        </Text>
                    </View>
                </View>

                {/* Información del código */}
                <View style={styles.codeInfo}>
                    <View style={styles.infoRow}>
                        <Text 
                            style={[
                                styles.infoLabel,
                                { color: code.textColor ? `${code.textColor}80` : '#6B7280' }
                            ]}
                        >
                            Código:
                        </Text>
                        <TouchableOpacity 
                            onPress={handleCopyCode}
                            style={styles.codeButton}
                            activeOpacity={0.7}
                        >
                            <Text 
                                style={[
                                    styles.codeValue,
                                    { color: code.textColor || '#374151' }
                                ]}
                            >
                                {code.code}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoRow}>
                        <Text 
                            style={[
                                styles.infoLabel,
                                { color: code.textColor ? `${code.textColor}80` : '#6B7280' }
                            ]}
                        >
                            Válido hasta:
                        </Text>
                        <Text 
                            style={[
                                styles.infoValue,
                                { color: code.textColor || '#374151' }
                            ]}
                        >
                            {formatDate(code.expiresAt)}
                        </Text>
                    </View>

                    {/* Información adicional según el estado */}
                    {code.status === 'used' && code.usedAt && (
                        <View style={styles.usedInfo}>
                            <Text 
                                style={[
                                    styles.usedText,
                                    { color: code.textColor ? `${code.textColor}60` : '#9CA3AF' }
                                ]}
                            >
                                Utilizado el {formatDate(code.usedAt)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Indicador de interacción */}
            <View style={styles.interactionHint}>
                <Text style={styles.hintText}>
                    {code.status === 'active' ? 'Toca el código para copiar' : 'Toca para ver detalles'}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    statusContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 1,
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
    },
    content: {
        marginTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingRight: 80, // Espacio para el badge de estado
    },
    codeName: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        flex: 1,
        marginRight: 12,
    },
    discountBadge: {
        backgroundColor: '#E8ACD2',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    discountText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Poppins-Bold',
    },
    codeInfo: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        flex: 1,
    },
    codeValue: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        letterSpacing: 1,
    },
    infoValue: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        textAlign: 'right',
        flex: 1,
    },
    usedInfo: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    usedText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
    },
    interactionHint: {
        marginTop: 12,
        alignItems: 'center',
    },
    hintText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
});