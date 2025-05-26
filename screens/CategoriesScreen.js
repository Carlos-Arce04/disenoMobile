// screens/CategoriesScreen.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { getCategories } from '../backend/platziapi';
import { ThemeContext } from '../ThemeContext';

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);
  const { isDarkMode }          = useContext(ThemeContext);

  useEffect(() => {
    (async () => {
      try {
        // Ahora devuelve directamente array de categorías
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.item, isDarkMode ? styles.itemDark : styles.itemLight]}
      onPress={() =>
        navigation.navigate('CategoriesDetail', {
          categoryId: item.id,
          categoryName: item.name
        })
      }
    >
      <Text style={[styles.text, isDarkMode ? styles.textDark : styles.textLight]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <FlatList
        data={categories}
        keyExtractor={c => c.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  bgDark:    { backgroundColor: '#111' },
  bgLight:   { backgroundColor: '#f2f2f2' },
  item:      { padding: 12, borderRadius: 6 },
  itemDark:  { backgroundColor: '#333' },
  itemLight: { backgroundColor: '#fff' },
  text:      { fontSize: 16 },
  textDark:  { color: '#fff' },
  textLight: { color: '#000' },
  separator: { height: 8 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
