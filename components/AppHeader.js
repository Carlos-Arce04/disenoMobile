import React, { useContext } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions
} from 'react-native';
import { ThemeContext } from '../ThemeContext';

export default function AppHeader({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onMenuPress,
  onCartPress,
  onAccountPress,
  userEmail,
  categoryId // NUEVO
}) {
  const { isDarkMode, toggleDarkMode, language, toggleLanguage } = useContext(ThemeContext);
  const { width } = Dimensions.get('window');

  const getInitials = (email) => {
    if (!email) return '??';
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>
      <TextInput
        style={[
          styles.searchInput,
          { width: width * 0.5, color: isDarkMode ? '#fff' : '#000' },
          { backgroundColor: isDarkMode ? '#333' : '#fff' },
          { borderColor: isDarkMode ? '#555' : '#ccc' }
        ]}
        placeholder={language === 'es' ? 'Buscar productos...' : 'Search products...'}
        placeholderTextColor={isDarkMode ? '#888' : '#999'}
        value={searchQuery}
        onChangeText={setSearchQuery}
        returnKeyType="search"
        onSubmitEditing={() => onSearchSubmit && onSearchSubmit(searchQuery, categoryId)}
      />

      <TouchableOpacity onPress={toggleDarkMode} style={styles.iconBtn} accessibilityLabel="Cambiar tema">
        <Text style={[styles.iconTxt, { color: isDarkMode ? '#fff' : '#000' }]}>
          {isDarkMode ? '☀️' : '🌙'}
        </Text>
      </TouchableOpacity>
<TouchableOpacity onPress={toggleLanguage} style={styles.iconBtn} accessibilityLabel="Cambiar idioma">
  <Text
    style={[
      styles.iconTxt,
      { color: isDarkMode ? '#fff' : '#000' },
      { minWidth: 30, textAlign: 'center' } // Aquí agregas estas propiedades
    ]}
  >
    {language.toUpperCase()}
  </Text>
</TouchableOpacity>


      {onMenuPress && (
        <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn} accessibilityLabel="Abrir menú">
          <Text style={[styles.iconTxt, { color: isDarkMode ? '#fff' : '#000' }]}>☰</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onCartPress} style={styles.iconBtn} accessibilityLabel="Carrito de compras">
        <Text style={[styles.iconTxt, { color: isDarkMode ? '#fff' : '#000' }]}>🛒</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onAccountPress} style={styles.accountBtn} accessibilityLabel="Cuenta de usuario">
        <Text style={styles.accountTxt}>{getInitials(userEmail)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  darkBg: { backgroundColor: '#333' },
  lightBg: { backgroundColor: '#eee' },
  searchInput: { height: 40, borderRadius: 4, paddingHorizontal: 10, borderWidth: 1, marginRight: 8 },
  iconBtn: { marginHorizontal: 6 },
  iconTxt: { fontSize: 20 },
  accountBtn: {
    marginLeft: 8, backgroundColor: '#555', borderRadius: 20, width: 36, height: 36,
    justifyContent: 'center', alignItems: 'center'
  },
  accountTxt: { color: '#fff', fontWeight: 'bold' }
});
