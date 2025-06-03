import React, { useState, useEffect, useContext } from 'react';
import { View, Modal, TouchableOpacity, Text, Button, StyleSheet } from 'react-native';
import AppHeader from '../components/AppHeader';
import ProductExpensiveScreen from './ProductExpensiveScreen';
import { getCategories } from '../backend/platziapi';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { ThemeContext } from '../ThemeContext';

const TARGET_CATEGORY_IDS = [1, 2, 3, 4, 5];
const CAT_TRANSLATIONS = {
  1: { es: 'Ropa', en: 'Clothing' },
  2: { es: 'Electrónica', en: 'Electronics' },
  3: { es: 'Muebles', en: 'Furniture' },
  4: { es: 'Calzado', en: 'Shoes' },
  5: { es: 'Misceláneo', en: 'Miscellaneous' }
};

export default function HomeScreen({ navigation, setIsUserVerified }) {
  const { user, logout } = useGoogleAuth();
  const { isDarkMode, language } = useContext(ThemeContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const allCats = await getCategories();
        const filtered = allCats.filter(cat => TARGET_CATEGORY_IDS.includes(cat.id));
        setCategories(filtered);
      } catch (e) {
        console.error('Error cargando categorías:', e);
      }
    })();
  }, []);

  const getName = (cat) => {
    const tr = CAT_TRANSLATIONS[cat.id];
    return tr ? tr[language] : cat.name;
  };

  const handleLogout = async () => {
    await logout();
    setIsUserVerified(false);
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>
      <AppHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={() => navigation.navigate('Search', { query: searchQuery })}
        onMenuPress={() => setMenuVisible(true)}
        onCartPress={() => navigation.navigate('Cart')}
        onAccountPress={() => setAccountModalVisible(true)}
        userEmail={user?.email}
      />

      {/* Menú categorías */}
      <Modal visible={isMenuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
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
      <Modal visible={isAccountModalVisible} transparent animationType="slide" onRequestClose={() => setAccountModalVisible(false)}>
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

      {/* Contenido principal */}
      <ProductExpensiveScreen navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  darkBg: { backgroundColor: '#111' },
  lightBg: { backgroundColor: '#f2f2f2' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end'
  },
  menuContainer: {
    width: 200,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 60,
    marginRight: 10
  },
  darkMenu: { backgroundColor: '#333' },
  lightMenu: { backgroundColor: '#fff' },
  menuButton: { paddingVertical: 8, paddingHorizontal: 12 },
  menuText: { fontSize: 16 },
  modalBackdrop: { flex: 1 },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: 200,
    alignSelf: 'center',
    marginTop: 100
  }
});
