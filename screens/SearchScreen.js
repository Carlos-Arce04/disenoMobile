import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Button,
  Platform,
  Dimensions
} from 'react-native';
import { searchProducts } from '../backend/platziapi';
import ProductCard from '../components/ProductCard';
import { ThemeContext } from '../ThemeContext';

const PAGE_SIZE = 6;

export default function SearchScreen({ navigation, route }) {
  const { isDarkMode, language } = useContext(ThemeContext);
  const [query, setQuery] = useState(route.params?.query || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState('');

  const isWeb = Platform.OS === 'web';
  const NUM_COLS = isWeb ? 4 : 2;
  const MARGIN = isWeb ? 10 : 8;
  const { width } = Dimensions.get('window');
  const baseW = (width - (NUM_COLS - 1) * MARGIN) / NUM_COLS;
  const cardW = isWeb ? baseW : baseW * 0.9;

  const doSearch = async (q, p = 1) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchProducts(q, p);
      setResults(data);
    } catch (e) {
      console.error('Error buscando productos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    doSearch(query, page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    doSearch(query, 1);
  };

  const pageCount = useMemo(() => Math.ceil(results.length / PAGE_SIZE), [results]);
  const currentItems = useMemo(() => results.slice((page - 1) * PAGE_SIZE, (page - 1) * PAGE_SIZE + PAGE_SIZE), [results, page]);

  const handleFirst = () => setPage(1);
  const handlePrev = () => page > 1 && setPage(page - 1);
  const handleNext = () => page < pageCount && setPage(page + 1);
  const handleLast = () => setPage(pageCount);
  const handleGoTo = () => {
    const n = parseInt(inputPage, 10);
    if (n >= 1 && n <= pageCount) setPage(n);
    setInputPage('');
  };

  const labels = {
    search: language === 'es' ? 'Buscar' : 'Search',
    first:  language === 'es' ? 'Primera' : 'First',
    prev:   language === 'es' ? 'Anterior' : 'Previous',
    next:   language === 'es' ? 'Siguiente' : 'Next',
    last:   language === 'es' ? 'Última' : 'Last',
    go:     language === 'es' ? 'Ir' : 'Go'
  };

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>      
      {/* Búsqueda */}
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#555' : '#ccc' }]}
          placeholder={language === 'es' ? 'Buscar productos...' : 'Search products...'}
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Button title={labels.search} onPress={handleSearch} />
      </View>

      {loading ? (
        <ActivityIndicator color={isDarkMode ? '#fff' : '#000'} size="large" />
      ) : (
        <FlatList
          data={currentItems}
          keyExtractor={item => item.id.toString()}
          numColumns={NUM_COLS}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: MARGIN }}
          contentContainerStyle={{ padding: MARGIN }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              categoryId={item.category.id}
              cardWidth={cardW}
              margin={0}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            />
          )}
        />
      )}

      {results.length > 0 && (
        <View style={styles.pagination}>
          <Button title={labels.first} onPress={handleFirst} disabled={page === 1} />
          <Button title={labels.prev}  onPress={handlePrev}  disabled={page === 1} />
          <Text style={[styles.pageText, isDarkMode ? styles.darkText : styles.lightText]}>            
            {page} / {pageCount}
          </Text>
          <Button title={labels.next}  onPress={handleNext}  disabled={page === pageCount} />
          <Button title={labels.last}  onPress={handleLast}  disabled={page === pageCount} />
        </View>
      )}

      {results.length > 0 && (
        <View style={styles.gotoContainer}>
          <TextInput
            style={[styles.gotoInput, { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#555' : '#ccc' }]}
            placeholder="#"
            placeholderTextColor={isDarkMode ? '#fff' : '#000'}
            keyboardType="numeric"
            value={inputPage}
            onChangeText={setInputPage}
          />
          <Button title={labels.go} onPress={handleGoTo} disabled={pageCount <= 1} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  lightBg:      { backgroundColor: '#f2f2f2' },
  darkBg:       { backgroundColor: '#111' },
  lightText:    { color: '#000' },
  darkText:     { color: '#fff' },
  searchRow:    { flexDirection: 'row', alignItems: 'center', padding: 8 },
  input:        { flex: 1, borderWidth: 1, borderRadius: 4, paddingHorizontal: 8, height: 40, marginRight: 8 },
  pagination:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8 },
  pageText:     { fontSize: 16, fontWeight: 'bold' },
  gotoContainer:{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 8 },
  gotoInput:    { width: 50, borderWidth: 1, marginRight: 8, textAlign: 'center' }
});
