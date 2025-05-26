import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
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
import { getProducts } from '../backend/platziapi';
import ProductCard from '../components/ProductCard';
import { ThemeContext } from '../ThemeContext';

const TARGET_CATEGORY_IDS = [1, 2, 3, 4, 5];
const PAGE_SIZE = 6;

export default function ProductExpensiveScreen({ navigation }) {
  const { isDarkMode, language } = useContext(ThemeContext);
  const [allProducts, setAllProducts] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [inputPage,  setInputPage]  = useState('');
  const flatListRef = useRef(null);

  const isWeb    = Platform.OS === 'web';
  const NUM_COLS = isWeb ? 4 : 2;
  const MARGIN   = isWeb ? 10 : 8;
  const { width } = Dimensions.get('window');
  const baseW  = (width - (NUM_COLS - 1) * MARGIN) / NUM_COLS;
  const cardW  = isWeb ? baseW : baseW * 0.9;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let combined = [], p = 1;
        while (true) {
          const items = await getProducts(p++);
          if (!items.length) break;
          combined = combined.concat(items);
        }
        const filtered = combined.filter(prod =>
          TARGET_CATEGORY_IDS.includes(prod.category.id)
        );
        filtered.sort((a, b) => b.price - a.price);
        setAllProducts(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pageCount = useMemo(
    () => Math.ceil(allProducts.length / PAGE_SIZE),
    [allProducts]
  );
  const currentItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return allProducts.slice(start, start + PAGE_SIZE);
  }, [allProducts, page]);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [page]);

  const labels = {
    first: language === 'es' ? 'Primera'    : 'First',
    prev:  language === 'es' ? 'Anterior'   : 'Previous',
    next:  language === 'es' ? 'Siguiente'  : 'Next',
    last:  language === 'es' ? 'Última'     : 'Last',
    go:    language === 'es' ? 'Ir'         : 'Go',
  };

  const handleFirst = () => setPage(1);
  const handlePrev  = () => page > 1          && setPage(p => p - 1);
  const handleNext  = () => page < pageCount && setPage(p => p + 1);
  const handleLast  = () => setPage(pageCount);
  const handleGoTo  = () => {
    const n = parseInt(inputPage, 10);
    if (n >= 1 && n <= pageCount) setPage(n);
    setInputPage('');
  };

  if (loading) {
    return (
      <View style={[styles.center, isDarkMode ? styles.darkBg : styles.lightBg]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={currentItems}
        keyExtractor={i => i.id.toString()}
        numColumns={NUM_COLS}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: MARGIN }}
        contentContainerStyle={{ padding: MARGIN }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            categoryId={item.category.id}  
            cardWidth={cardW}
            margin={MARGIN}
            onPress={() =>
              navigation.navigate('ProductDetail', { productId: item.id })
            }
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
            {
              color: isDarkMode ? '#fff' : '#000',
              borderColor: isDarkMode ? '#555' : '#ccc'
            }
          ]}
          placeholder="#"
          placeholderTextColor={isDarkMode ? '#fff' : '#000'}
          keyboardType="numeric"
          value={inputPage}
          onChangeText={setInputPage}
        />
        <Button title={labels.go} onPress={handleGoTo} disabled={pageCount <= 1} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:      { flex: 1 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  darkBg:       { backgroundColor: '#111' },
  lightBg:      { backgroundColor: '#f2f2f2' },
  pagination:   { flexDirection: 'row', justifyContent: 'space-between', padding: 8, alignItems: 'center' },
  pageText:     { fontSize: 16, fontWeight: 'bold' },
  textDark:     { color: '#000' },
  textLight:    { color: '#fff' },
  gotoContainer:{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 8 },
  gotoInput:    { width: 50, borderWidth: 1, marginRight: 8, textAlign: 'center' }
});
