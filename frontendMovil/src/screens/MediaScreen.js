import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Image,
    Dimensions,
    Platform
} from "react-native";
import backIcon from '../images/backIcon.png';
import MediaCards from '../components/MediaCards';
import useMedia from "../hooks/useMedia";

const { width } = Dimensions.get('window');

const MediaScreen = ({ navigation }) => {
    const {
        displayedItems,
        activeFilter,
        loading,
        error,
        hasMoreItems,
        totalItems,
        loadMoreItems,
        handleFilterChange,
        refreshData,
        stats
    } = useMedia();

    // Filtros disponibles
    const filters = [
        { id: 'all', label: 'Todos', icon: '📚', color: '#8B5CF6' },
        { id: 'Blog', label: 'Blog', icon: '📝', color: '#06B6D4' },
        { id: 'Dato Curioso', label: 'Datos Curiosos', icon: '💡', color: '#F59E0B' },
        { id: 'Tip', label: 'Tips', icon: '✨', color: '#10B981' },
    ];

    // Componente de carga
    const LoadingComponent = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EC4899" />
            <Text style={styles.loadingText}>Cargando contenido...</Text>
        </View>
    );

    // Componente de error
    const ErrorComponent = () => (
        <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error al cargar contenido</Text>
            <Text style={styles.errorMessage}>{error || 'Ha ocurrido un error inesperado'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
                <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
            </TouchableOpacity>
        </View>
    );

    // Componente de estado vacío
    const EmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No hay contenido disponible</Text>
            <Text style={styles.emptyMessage}>
                No se encontraron artículos que coincidan con el filtro seleccionado.
            </Text>
            <TouchableOpacity
                style={styles.showAllButton}
                onPress={() => handleFilterChange('all')}
            >
                <Text style={styles.showAllButtonText}>Ver todos los artículos</Text>
            </TouchableOpacity>
        </View>
    );

    // Renderizar filtro
    const renderFilter = (filter) => {
        const isActive = activeFilter === filter.id;
        return (
            <TouchableOpacity
                key={filter.id}
                style={[
                    styles.filterButton,
                    isActive ? [styles.activeFilterButton, { backgroundColor: filter.color }] : null
                ]}
                onPress={() => handleFilterChange(filter.id)}
                disabled={loading}
            >
                <Text style={styles.filterIcon}>{filter.icon}</Text>
                <Text style={[
                    styles.filterLabel,
                    isActive ? styles.activeFilterLabel : null
                ]}>
                    {filter.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Image source={backIcon} style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Blog de Marquesa</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refreshData}
                        colors={['#EC4899']}
                        tintColor="#EC4899"
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Descripción principal */}
                <View style={styles.descriptionContainer}>
                    <Text style={styles.description}>
                        Descubre consejos, técnicas y contenido especialmente diseñado para el cuidado y disfrute de las flores.
                    </Text>

                    {/* Estadísticas */}
                    {stats && !loading && (
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.total}</Text>
                                <Text style={styles.statLabel}>artículos</Text>
                            </View>
                            {stats.totalViews > 0 && (
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{stats.totalViews.toLocaleString()}</Text>
                                    <Text style={styles.statLabel}>visualizaciones</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Filtros */}
                {!error && (
                    <View style={styles.filtersContainer}>
                        <Text style={styles.filtersTitle}>Explora nuestro contenido</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filtersScrollContainer}
                        >
                            {filters.map(renderFilter)}
                        </ScrollView>
                    </View>
                )}

                {/* Contador de resultados */}
                {!error && !loading && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsText}>
                            {displayedItems.length === 0 ? (
                                'No se encontraron artículos para este filtro'
                            ) : (
                                `Mostrando ${displayedItems.length} de ${totalItems} artículos`
                            )}
                        </Text>
                        {activeFilter !== 'all' && displayedItems.length > 0 && (
                            <View style={styles.filterTag}>
                                <Text style={styles.filterTagText}>Filtro: {activeFilter}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Contenido principal */}
                {loading ? (
                    <LoadingComponent />
                ) : error ? (
                    <ErrorComponent />
                ) : displayedItems.length > 0 ? (
                    <View style={styles.mediaGrid}>
                        {displayedItems.map((item, index) => (
                            <MediaCards
                                key={item.id}
                                item={item}
                                index={index}
                                navigation={navigation}
                            />
                        ))}
                    </View>
                ) : (
                    <EmptyComponent />
                )}

                {/* Botón cargar más */}
                {hasMoreItems && displayedItems.length > 0 && !loading && !error && (
                    <TouchableOpacity
                        style={styles.loadMoreButton}
                        onPress={loadMoreItems}
                    >
                        <Text style={styles.loadMoreText}>Cargar más contenido</Text>
                    </TouchableOpacity>
                )}

                {/* Sección CTA */}
                <View style={styles.ctaContainer}>
                    <Text style={styles.ctaTitle}>¿Te gustó nuestro contenido?</Text>
                    <Text style={styles.ctaDescription}>
                        Explora nuestra tienda para encontrar los mejores arreglos florales y productos especiales.
                    </Text>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.ctaButtonText}>Explorar tienda</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 20,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    descriptionContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        alignItems: 'center',
    },
    description: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        fontFamily: 'Poppins-SemiBold'
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        fontFamily: 'Poppins-Regular'
    },
    filtersContainer: {
        paddingVertical: 20,
    },
    filtersTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 16,
        marginTop: -18,
        fontFamily: 'Poppins-SemiBold'
    },
    filtersScrollContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        position: 'relative',
    },
    activeFilterButton: {
        borderColor: 'transparent',
    },
    filterIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    filterLabel: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
        fontFamily: 'Poppins-Regular'
    },
    activeFilterLabel: {
        color: '#ffffff',
    },
    activeIndicator: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ffffff',
    },
    resultsContainer: {
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        alignItems: 'center',
    },
    resultsText: {
        fontSize: 14,
        color: '#6b7280',
        fontFamily: 'Poppins-Regular',
    },
    filterTag: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#dbeafe',
        borderRadius: 16,
    },
    filterTagText: {
        fontSize: 12,
        color: '#1e40af',
        fontFamily: 'Poppins-Regular',
    },
    mediaGrid: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#6b7280',
        fontFamily: 'Poppins-Regular',
    },
    errorContainer: {
        margin: 20,
        padding: 20,
        backgroundColor: '#fef2f2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fecaca',
        alignItems: 'center',
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#991b1b',
        marginBottom: 8,
        fontFamily: 'Poppins-SemiBold',
    },
    errorMessage: {
        fontSize: 14,
        color: '#dc2626',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: 'Poppins-Regular',
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fee2e2',
        borderRadius: 20,
    },
    retryButtonText: {
        fontSize: 14,
        color: '#991b1b',
        fontWeight: '500',
        fontFamily: 'Poppins-Regular',
    },
    emptyContainer: {
        margin: 20,
        padding: 40,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
        fontFamily: 'Poppins-SemiBold',
    },
    emptyMessage: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
        fontFamily: 'Poppins-Regular',
    },
    showAllButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fce7f3',
        borderRadius: 25,
    },
    showAllButtonText: {
        fontSize: 14,
        color: '#be185d',
        fontWeight: '500',
        fontFamily: 'Poppins-Regular',
    },
    loadMoreButton: {
        marginHorizontal: 20,
        marginVertical: 20,
        paddingVertical: 16,
        backgroundColor: '#fce7f3',
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loadMoreText: {
        fontSize: 16,
        color: '#be185d',
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
    ctaContainer: {
        margin: 20,
        padding: 24,
        backgroundColor: '#fdf2f8',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fce7f3',
        alignItems: 'center',
    },
    ctaTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: 'Poppins-SemiBold',
    },
    ctaDescription: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
        fontFamily: 'Poppins-Regular',
    },
    ctaButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#fce7f3',
        borderRadius: 25,
    },
    ctaButtonText: {
        fontSize: 16,
        color: '#be185d',
        fontWeight: '600',
        fontFamily: 'Poppins-SemiBold',
    },
});

export default MediaScreen;