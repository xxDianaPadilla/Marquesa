import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useFonts } from 'expo-font';
import { DancingScript_400Regular } from '@expo-google-fonts/dancing-script';
import backIcon from '../images/backIcon.png';

const TermsAndConditions = ({ navigation }) => {
  let [fontsLoaded] = useFonts({
    DancingScript_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header con back y título */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.terminos}>TÉRMINOS </Text>
          <Text style={styles.yScript}>y</Text>
          <Text style={styles.condiciones}> CONDICIONES</Text>
        </View>

        {/* Línea rosa justo debajo de la "y" */}
        <View style={styles.lineContainer}>
          <View style={styles.headerLine} />
        </View>

        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.introText}>
            Al utilizar los servicios de Marquesa, aceptas los siguientes términos:
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Pedidos</Text>
            <Text style={styles.sectionText}>
              Todos los pedidos deben realizarse a través de nuestros canales oficiales (redes sociales,
              sitio web, whatsapp y email). El pago en los productos personalizados o una cantidad mayor de 6 productos de
              cualquiera de nuestros catálogo, se debe efectuar un 50% de anticipo y contra entrega al
              efectuar el complemento del pago. Agenda de pedidos: Los pedidos se pueden realizar en base a disponibilidad de fechas y
              horas de entrega.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Productos</Text>
            <Text style={styles.sectionText}>
              Nuestros arreglos pueden variar ligeramente en diseño y flores según disponibilidad estacional,
              pero se respeta siempre el estilo y calidad ofrecidos.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Precios</Text>
            <Text style={styles.sectionText}>
              Los precios están expresados en dólares estadounidenses (USD) e incluyen IVA. Los costos de envío pueden variar según la zona.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Cancelaciones y reembolsos</Text>
            <Text style={styles.sectionText}>
              Los pedidos pueden cancelarse hasta 48 horas después de la fecha que se emitió la orden del pedido.
              No se hacen reembolsos por cancelaciones fuera de ese plazo o por errores en los datos proporcionados por el cliente.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Uso del contenido</Text>
            <Text style={styles.sectionText}>
              Todo el contenido visual, logotipos y fotografías pertenecen a Marquesa y no puede ser usado sin autorización previa.
            </Text>
          </View>

          <View style={styles.footerMessage}>
            <Text style={styles.footerText}>
              Al continuar usando esta app, confirmas que has leído y aceptado estos términos y condiciones.
            </Text>
            <Text style={styles.versionText}>Versión de la app.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingTop: Platform.OS === 'ios' ? 30 : 10, // 👈 antes era 50 y 20
  paddingBottom: 10, // también puedes reducir esto
  backgroundColor: '#ffffff',
  marginBottom: 10,
  marginTop: 40,
},

  backButton: { padding: 8 },
  backIcon: { width: 24, height: 24, resizeMode: 'contain', left: -10, },
  placeholder: { width: 40 },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    
  },
  terminos: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#000', letterSpacing: 1 },
  yScript: { fontSize: 26, fontFamily: 'DancingScript_400Regular', color: '#000', marginHorizontal: 4 },
  condiciones: { fontSize: 20, fontFamily: 'Poppins-Light', color: '#000', letterSpacing: 1 },
  lineContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    width: '100%',
    left: 20,
  },
  headerLine: {
    height: 4,
    backgroundColor: '#f5c7e6',
    width: 90,
    borderRadius: 2,
  },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  introText: { fontSize: 16, fontFamily: 'Poppins-Regular', color: '#333', marginBottom: 30, lineHeight: 24 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins-SemiBold', color: '#000', marginBottom: 8 },
  sectionText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#1d1d1d', lineHeight: 22, textAlign: 'justify' },
  footerMessage: { marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  footerText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#333', textAlign: 'center', lineHeight: 20, marginBottom: 10 },
  versionText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#999', textAlign: 'center' },
});

export default TermsAndConditions;
