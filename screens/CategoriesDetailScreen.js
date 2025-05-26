import React, { useEffect, useState, useContext, useMemo, useRef } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
  Button,
  Text,
  TextInput
} from 'react-native';
import { getProductsByCategory } from '../backend/platziapi';
import ProductCard from '../components/ProductCard';
import { ThemeContext } from '../ThemeContext';

const PAGE_SIZE = 6;

export default function CategoriesDetailScreen({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  const { isDarkMode, language }     = useContext(ThemeContext);

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [inputPage, setInputPage]     = useState('');
  const flatListRef = useRef(null);

  const isWeb   = Platform.OS === 'web';
  const numCols = isWeb ? 4 : 2;
  const MARGIN  = isWeb ? 10 : 8;
  const { width } = Dimensions.get('window');
  const baseW = (width - (numCols - 1) * MARGIN) / numCols;
  const cardW = isWeb ? baseW : baseW * 0.9;

  useEffect(() => {
    navigation.setOptions({ title: categoryName });
    (async () => {
      setLoading(true);
      try {
        let combined = [], p = 1;
        while (true) {
          const items = await getProductsByCategory(categoryId, p++);
          if (!items.length) break;
          combined = combined.concat(items);
          if (items.length < PAGE_SIZE) break;
        }
        setAllProducts(combined);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId]);

  const pageCount = useMemo(() => Math.ceil(allProducts.length / PAGE_SIZE), [allProducts]);
  const currentItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return allProducts.slice(start, start + PAGE_SIZE);
  }, [allProducts, page]);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [page]);

  const labels = {
    first: language === 'es' ? 'Primera'   : 'First',
    prev:  language === 'es' ? 'Anterior'  : 'Previous',
    next:  language === 'es' ? 'Siguiente' : 'Next',
    last:  language === 'es' ? 'Última'    : 'Last',
    go:    language === 'es' ? 'Ir'        : 'Go'
  };

  const handleFirst = () => setPage(1);
  const handlePrev  = () => page > 1 && setPage(p => p - 1);
  const handleNext  = () => page < pageCount && setPage(p => p + 1);
  const handleLast  = () => setPage(pageCount);
  const handleGoTo  = () => {
    const n = parseInt(inputPage, 10);
    if (n >= 1 && n <= pageCount) setPage(n);
    setInputPage('');
  };

  if (loading) {
    return (
      <View style={[styles.center, isDarkMode ? styles.bgDark : styles.bgLight]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <FlatList
        ref={flatListRef}
        data={currentItems}
        keyExtractor={i => i.id.toString()}
        numColumns={numCols}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: MARGIN }}
        contentContainerStyle={{ padding: MARGIN }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            categoryId={item.category.id}
            cardWidth={cardW}
            margin={MARGIN}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          />
        )}
      />

      <View style={styles.pagination}>
        <Button title={labels.first} onPress={handleFirst} disabled={page === 1} />
        <Button title={labels.prev}  onPress={handlePrev}  disabled={page === 1} />
        <Text style={[styles.pageText, isDarkMode ? styles.textLight : styles.textDark]}>
          {page} / {pageCount}
        </Text>
        <Button title={labels.next}  onPress={handleNext}  disabled={page === pageCount} />
        <Button title={labels.last}  onPress={handleLast}  disabled={page === pageCount} />
      </View>

      <View style={styles.gotoContainer}>
        <TextInput
          style={[
            styles.gotoInput,
            { color: isDarkMode ? '#fff' : '#000', borderColor: isDarkMode ? '#555' : '#ccc' }
          ]}
          placeholder="#"
          placeholderTextColor={isDarkMode ? '#fff' : '#000'}
          keyboardType="numeric"
          value={inputPage}
          onChangeText={setInputPage}
        />
        <Button 
          title={labels.go} 
          onPress={handleGoTo} 
          disabled={pageCount <= 1} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  bgDark:       { backgroundColor: '#111' },
  bgLight:      { backgroundColor: '#f2f2f2' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pagination:   { flexDirection: 'row', justifyContent: 'space-between', padding: 8, alignItems: 'center' },
  pageText:     { fontSize: 16, fontWeight: 'bold' },
  textDark:     { color: '#000' },
  textLight:    { color: '#fff' },
  gotoContainer:{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 8 },
  gotoInput:    { width: 50, borderWidth: 1, marginRight: 8, textAlign: 'center' }
});
