import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation, useRoute } from '@react-navigation/native';
import backIcon from '../images/backIcon.png';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoPlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const videoRef = useRef(null);

  // Estados del reproductor
  const [status, setStatus] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);
  const [orientation, setOrientation] = useState('portrait');

  // Obtener dimensiones actuales
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  // Obtener datos del video desde los parámetros de navegación
  const { videoData } = route.params || {};

  // Datos por defecto si no se pasan parámetros
  const defaultVideoData = {
    id: '1',
    title: 'Video sin título',
    videoUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
    thumbnail: 'https://via.placeholder.com/400x250',
    author: 'Autor desconocido',
    date: new Date().toLocaleDateString('es-ES'),
    content: 'Descripción no disponible',
    category: 'General',
    duration: null,
    views: 0
  };

  const video = videoData || defaultVideoData;

  // Componentes de iconos personalizados
  const PlayIcon = ({ size = 24, color = '#FFFFFF' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={[styles.playTriangle, { 
        borderLeftColor: color,
        borderTopWidth: size * 0.4,
        borderBottomWidth: size * 0.4,
        borderLeftWidth: size * 0.6
      }]} />
    </View>
  );

  const PauseIcon = ({ size = 24, color = '#FFFFFF' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={styles.pauseContainer}>
        <View style={[styles.pauseBar, { backgroundColor: color, width: size * 0.25, height: size * 0.8 }]} />
        <View style={[styles.pauseBar, { backgroundColor: color, width: size * 0.25, height: size * 0.8 }]} />
      </View>
    </View>
  );

  const RestartIcon = ({ size = 20, color = '#FFFFFF' }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={[styles.restartCircle, { 
        width: size * 0.8, 
        height: size * 0.8, 
        borderColor: color 
      }]}>
        <View style={[styles.restartArrow, { borderLeftColor: color }]} />
      </View>
    </View>
  );

  const FullscreenIcon = ({ size = 20, color = '#FFFFFF', isFullscreen = false }) => (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {isFullscreen ? (
        // Icono para salir de pantalla completa
        <View style={styles.fullscreenContainer}>
          <View style={[styles.fullscreenCorner, styles.topLeft, { borderColor: color }]} />
          <View style={[styles.fullscreenCorner, styles.topRight, { borderColor: color }]} />
          <View style={[styles.fullscreenCorner, styles.bottomLeft, { borderColor: color }]} />
          <View style={[styles.fullscreenCorner, styles.bottomRight, { borderColor: color }]} />
        </View>
      ) : (
        // Icono para entrar en pantalla completa
        <View style={styles.fullscreenContainer}>
          <View style={[styles.fullscreenExpand, styles.topLeft, { borderColor: color }]} />
          <View style={[styles.fullscreenExpand, styles.topRight, { borderColor: color }]} />
          <View style={[styles.fullscreenExpand, styles.bottomLeft, { borderColor: color }]} />
          <View style={[styles.fullscreenExpand, styles.bottomRight, { borderColor: color }]} />
        </View>
      )}
    </View>
  );

  // Limpiar timers al desmontar el componente
  useEffect(() => {
    let controlsTimer;
    
    if (showControls && isPlaying) {
      controlsTimer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimer) {
        clearTimeout(controlsTimer);
      }
    };
  }, [showControls, isPlaying]);

  // Manejar la carga del video
  const handlePlaybackStatusUpdate = (status) => {
    setStatus(status);
    
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
      
      if (status.error) {
        setError(status.error);
        console.error('Error de reproducción:', status.error);
      }
    } else if (status.error) {
      setIsLoading(false);
      setError('Error al cargar el video');
      console.error('Error al cargar video:', status.error);
    }
  };

  // Reproducir/pausar video
  const togglePlayback = async () => {
    try {
      if (videoRef.current) {
        if (isPlaying) {
          await videoRef.current.pauseAsync();
        } else {
          await videoRef.current.playAsync();
        }
        setShowControls(true);
      }
    } catch (error) {
      console.error('Error al controlar reproducción:', error);
      Alert.alert('Error', 'No se pudo controlar la reproducción del video');
    }
  };

  // Reiniciar video
  const restartVideo = async () => {
    try {
      if (videoRef.current) {
        await videoRef.current.replayAsync();
        setShowControls(true);
      }
    } catch (error) {
      console.error('Error al reiniciar video:', error);
    }
  };

  // Mostrar/ocultar controles al tocar la pantalla
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Toggle pantalla completa con rotación automática
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Entrar en pantalla completa
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullscreen(true);
        StatusBar.setHidden(true, 'fade');
      } else {
        // Salir de pantalla completa
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsFullscreen(false);
        StatusBar.setHidden(false, 'fade');
      }
      setShowControls(true);
    } catch (error) {
      console.error('Error al cambiar pantalla completa:', error);
    }
  };

  // Limpiar orientación al salir
  useEffect(() => {
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Formatear duración del video
  const formatDuration = (milliseconds) => {
    if (!milliseconds) return '0:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calcular progreso del video
  const getProgressPercentage = () => {
    if (status.durationMillis && status.positionMillis) {
      return (status.positionMillis / status.durationMillis) * 100;
    }
    return 0;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#000" 
          hidden={isFullscreen}
        />
        
        {/* Header - oculto en pantalla completa */}
        {!isFullscreen && (
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Image source={backIcon} style={styles.backIcon} />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {video.title}
              </Text>
              <Text style={styles.headerSubtitle}>
                {video.category} • {video.author}
              </Text>
            </View>
          </View>
        )}

        {/* Reproductor de video */}
        <View style={[
          styles.videoContainer,
          isFullscreen && styles.fullscreenVideoContainer
        ]}>
          {error ? (
            // Mostrar error si el video no se puede cargar
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error al cargar el video</Text>
              <Text style={styles.errorSubtext}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setError(null);
                  setIsLoading(true);
                  videoRef.current?.replayAsync();
                }}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Video
                ref={videoRef}
                style={styles.video}
                source={{ uri: video.videoUrl }}
                useNativeControls={false}
                resizeMode="contain"
                isLooping={false}
                shouldPlay={false}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              />

              {/* Controles personalizados */}
              <TouchableOpacity 
                style={styles.videoOverlay}
                onPress={toggleControls}
                activeOpacity={1}
              >
                {(showControls || isLoading) && (
                  <View style={styles.controlsContainer}>
                    {/* Header para pantalla completa */}
                    {isFullscreen && showControls && (
                      <View style={styles.fullscreenHeader}>
                        <TouchableOpacity
                          style={styles.fullscreenBackButton}
                          onPress={() => navigation.goBack()}
                        >
                          <Image source={backIcon} style={styles.backIcon} />
                        </TouchableOpacity>
                        
                        <View style={styles.fullscreenHeaderInfo}>
                          <Text style={styles.fullscreenTitle} numberOfLines={1}>
                            {video.title}
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Cargando video...</Text>
                      </View>
                    ) : (
                      <>
                        {/* Botón de reproducción central */}
                        <TouchableOpacity
                          style={styles.playButton}
                          onPress={togglePlayback}
                        >
                          {isPlaying ? (
                            <PauseIcon size={32} />
                          ) : (
                            <PlayIcon size={32} />
                          )}
                        </TouchableOpacity>

                        {/* Controles inferiores */}
                        <View style={styles.bottomControls}>
                          <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                              <View 
                                style={[
                                  styles.progressFill,
                                  { width: `${getProgressPercentage()}%` }
                                ]} 
                              />
                            </View>
                            
                            <View style={styles.timeContainer}>
                              <Text style={styles.timeText}>
                                {formatDuration(status.positionMillis)}
                              </Text>
                              <Text style={styles.timeText}>
                                {formatDuration(status.durationMillis)}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.controlButtons}>
                            <TouchableOpacity 
                              style={styles.controlButton}
                              onPress={restartVideo}
                            >
                              <RestartIcon size={20} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={styles.controlButton}
                              onPress={toggleFullscreen}
                            >
                              <FullscreenIcon size={20} isFullscreen={isFullscreen} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Información del video - oculta en pantalla completa */}
        {!isFullscreen && (
          <ScrollView style={styles.infoContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              
              <View style={styles.videoMeta}>
                <Text style={styles.metaText}>
                  {video.views > 0 ? `${video.views} visualizaciones` : 'Sin visualizaciones'} • {video.date}
                </Text>
                <Text style={styles.authorText}>Por {video.author}</Text>
              </View>

              <View style={styles.categoryContainer}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{video.category}</Text>
                </View>
                
                {video.duration && (
                  <View style={styles.durationTag}>
                    <Text style={styles.durationText}>
                      Duración: {formatDuration(video.duration)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>Descripción</Text>
                <Text style={styles.descriptionText}>
                  {video.content || 'Sin descripción disponible.'}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },

  // Video Container
  videoContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    position: 'relative',
  },
  fullscreenVideoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    aspectRatio: null,
    zIndex: 1000,
    width: '100%',
    height: '100%',
  },

  // Estilos para iconos personalizados
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 3,
  },
  pauseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
    height: '100%',
  },
  pauseBar: {
    borderRadius: 1,
  },
  restartCircle: {
    borderWidth: 2,
    borderRadius: 50,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restartArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
    top: -3,
    right: -2,
  },
  fullscreenContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  fullscreenCorner: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 2,
  },
  fullscreenExpand: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderWidth: 2,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  video: {
    flex: 1,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Error Container
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  errorSubtext: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#E8ACD2',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },

  // Controls
  controlsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1001,
  },
  fullscreenBackButton: {
    padding: 8,
    marginRight: 12,
  },
  fullscreenHeaderInfo: {
    flex: 1,
  },
  fullscreenTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  playButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
  },

  // Bottom Controls
  bottomControls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E8ACD2',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlButton: {
    padding: 10,
    marginHorizontal: 5,
  },
  controlButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },

  // Video Info
  infoContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  videoInfo: {
    padding: 20,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  videoMeta: {
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  authorText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryTag: {
    backgroundColor: '#E8ACD2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  durationTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  descriptionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  descriptionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
});

export default VideoPlayerScreen;