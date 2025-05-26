import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Button,
  Platform,
  Dimensions
} from 'react-native';
import ProductExpensiveScreen from './ProductExpensiveScreen';
import { getCategories } from '../backend/platziapi';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { ThemeContext } from '../ThemeContext';

// IDs fijas para mostrar en menú de categorías
const TARGET_CATEGORY_IDS = [1, 2, 3, 4, 5];
// Traducciones por ID
const CAT_TRANSLATIONS = {
  1: { es: 'Ropa', en: 'Clothing' },
  2: { es: 'Electrónica', en: 'Electronics' },
  3: { es: 'Muebles', en: 'Furniture' },
  4: { es: 'Calzado', en: 'Shoes' },
  5: { es: 'Misceláneo', en: 'Miscellaneous' }
};

export default function HomeScreen({ navigation, setIsUserVerified }) {
  const isWeb = Platform.OS === 'web';
  const { width } = Dimensions.get('window');

  const { user, logout } = useGoogleAuth();
  const { isDarkMode, toggleDarkMode, language, toggleLanguage } = useContext(ThemeContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const allCats = await getCategories();
        // Filtrar y traducir
        const filtered = allCats.filter(cat => TARGET_CATEGORY_IDS.includes(cat.id));
        setCategories(filtered);
      } catch (e) {
        console.error('Error cargando categorías:', e);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserVerified(false);
    
  };

  const getInitials = email =>
    email?.split('@')[0].substring(0, 2).toUpperCase() || '??';

  const getName = (cat) => {
    const tr = CAT_TRANSLATIONS[cat.id];
    return tr ? tr[language] : cat.name;
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>    
      {/* Barra superior */}
      <View style={[styles.topBar, isDarkMode ? styles.darkBar : styles.lightBar]}>      
        <TextInput
          style={[
            styles.searchInput,
            { width: width * 0.4, color: isDarkMode ? '#fff' : '#000' },
            { backgroundColor: isDarkMode ? '#333' : '#fff' },
            { borderColor: isDarkMode ? '#555' : '#ccc' }
          ]}
          placeholder={language === 'es' ? 'Buscar productos...' : 'Search products...'}
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={() => navigation.navigate('Search', { query: searchQuery })}
        />
        <TouchableOpacity onPress={toggleDarkMode} style={styles.iconBtn}>
          <Text style={[styles.iconTxt, { color: isDarkMode ? '#fff' : '#000' }]}>  
            {isDarkMode ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLanguage} style={styles.iconBtn}>
          <Text style={[styles.iconTxt, { color: isDarkMode ? '#fff' : '#000' }]}>  
            {language.toUpperCase()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconBtn}>
          <Text style={[styles.iconTxt, { color: isDarkMode ? '#fff' : '#000' }]}>☰</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.iconBtn}>
          <Text style={[styles.iconTxt, { color: isDarkMode ? '#fff' : '#000' }]}>🛒</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setAccountModalVisible(true)} style={styles.accountBtn}>
          <Text style={styles.accountTxt}>{getInitials(user?.email)}</Text>
        </TouchableOpacity>
      </View>

      {/* Menú categorías flotante */}
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.menuContainer, isDarkMode ? styles.darkMenu : styles.lightMenu]}>          
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={styles.menuButton}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('CategoriesDetail', {
                    categoryId: cat.id,
                    categoryName: getName(cat)
                  });
                }}
              >
                <Text style={[styles.menuText, { color: isDarkMode ? '#fff' : '#000' }]}>
                  {getName(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setMenuVisible(false)} />
        </View>
      </Modal>

      {/* Modal cuenta */}
      <Modal
        visible={isAccountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Button
              title={language === 'es' ? 'Cerrar sesión' : 'Sign Out'}
              onPress={handleLogout}
            />
            <Button
              title={language === 'es' ? 'Volver' : 'Back'}
              onPress={() => setAccountModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Contenido principal: Productos caros */}
      <ProductExpensiveScreen navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  darkBg:      { backgroundColor: '#111' },
  lightBg:     { backgroundColor: '#f2f2f2' },
  topBar:      { flexDirection: 'row', alignItems: 'center', padding: 10 },
  darkBar:     { backgroundColor: '#333' },
  lightBar:    { backgroundColor: '#eee' },
  searchInput: { height: 40, borderRadius: 4, paddingHorizontal: 10, flex: 1, borderWidth: 1 },
  iconBtn:     { marginHorizontal: 8 },
  iconTxt:     { fontSize: 18 },
  accountBtn:  { marginLeft: 8, backgroundColor: '#555', borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  accountTxt:  { color: '#fff', fontWeight: 'bold' },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', alignItems: 'flex-end' },
  menuContainer:  { width: 200, paddingVertical: 10, borderRadius: 8, marginTop: 60, marginRight: 10 },
  darkMenu:       { backgroundColor: '#333' },
  lightMenu:      { backgroundColor: '#fff' },
  menuButton:     { paddingVertical: 8, paddingHorizontal: 12 },
  menuText:       { fontSize: 16 },
  modalBackdrop:  { flex: 1 },
  modalBox:       { backgroundColor: '#fff', padding: 20, borderRadius: 8, width: 200, alignSelf: 'center', marginTop: 100 }
});