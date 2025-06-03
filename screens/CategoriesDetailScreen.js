import React, { useEffect, useState, useContext, useMemo, useRef, useLayoutEffect } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { getProductsByCategoryWithPriceFilter } from '../backend/platziapi';
import ProductCard from '../components/ProductCard';
import { ThemeContext } from '../ThemeContext';
import AppHeader from '../components/AppHeader';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

const PAGE_SIZE = 6;

// Traducciones para categorías
const CAT_TRANSLATIONS = {
  1: { es: 'Ropa', en: 'Clothing' },
  2: { es: 'Electrónica', en: 'Electronics' },
  3: { es: 'Muebles', en: 'Furniture' },
  4: { es: 'Calzado', en: 'Shoes' },
  5: { es: 'Misceláneo', en: 'Miscellaneous' }
};

export default function CategoriesDetailScreen({ route, navigation }) {
  const { categoryId } = route.params; // Usamos solo categoryId
  const { isDarkMode, language } = useContext(ThemeContext);
  const { user } = useGoogleAuth();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const flatListRef = useRef(null);

  // Estados filtro rango precio y orden
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  // Estado para búsqueda local dentro de los productos cargados
  const [searchQuery, setSearchQuery] = useState('');

  const isWeb = Platform.OS === 'web';
  const numCols = isWeb ? 4 : 2;
  const MARGIN = isWeb ? 10 : 8;
  const { width } = Dimensions.get('window');
  const baseW = (width - (numCols - 1) * MARGIN) / numCols;
  const cardW = isWeb ? baseW : baseW * 0.9;

  // Para animar el desplegable
  const filterAnim = useRef(new Animated.Value(0)).current;

  const toggleFilter = () => {
    if (filterVisible) {
      Animated.timing(filterAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start(() => setFilterVisible(false));
    } else {
      setFilterVisible(true);
      Animated.timing(filterAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  };

  // Actualizar título dinámicamente según idioma y categoría
  useLayoutEffect(() => {
    const title = CAT_TRANSLATIONS[categoryId]
      ? CAT_TRANSLATIONS[categoryId][language]
      : 'Category';
    navigation.setOptions({ title });
  }, [language, navigation, categoryId]);

  // Carga productos con filtro rango, orden y búsqueda local
  const loadProducts = async () => {
    setLoading(true);
    try {
      let combined = [];
      let p = 1;
      while (true) {
        const items = await getProductsByCategoryWithPriceFilter(
          categoryId,
          priceMin ? Number(priceMin) : undefined,
          priceMax ? Number(priceMax) : undefined,
          p++
        );
        if (!items.length) break;
        combined = combined.concat(items);
        if (items.length < PAGE_SIZE) break;
      }
      combined.sort((a, b) => (sortAsc ? a.price - b.price : b.price - a.price));

      if (searchQuery.trim()) {
        combined = combined.filter(p =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setAllProducts(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [categoryId, priceMin, priceMax, sortAsc, searchQuery]);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [page]);

  const pageCount = useMemo(() => Math.ceil(allProducts.length / PAGE_SIZE), [allProducts]);
  const currentItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return allProducts.slice(start, start + PAGE_SIZE);
  }, [allProducts, page]);

  const labels = {
    first: language === 'es' ? 'Primera' : 'First',
    prev: language === 'es' ? 'Anterior' : 'Previous',
    next: language === 'es' ? 'Siguiente' : 'Next',
    last: language === 'es' ? 'Última' : 'Last',
    go: language === 'es' ? 'Ir' : 'Go',
    filters: language === 'es' ? 'Filtros' : 'Filters',
    minPrice: language === 'es' ? 'Precio mínimo' : 'Min Price',
    maxPrice: language === 'es' ? 'Precio máximo' : 'Max Price',
    sort: language === 'es' ? 'Ordenar por precio' : 'Sort by price',
    asc: language === 'es' ? 'Menor a mayor' : 'Low to High',
    desc: language === 'es' ? 'Mayor a menor' : 'High to Low',
  };

  const handleFirst = () => setPage(1);
  const handlePrev = () => page > 1 && setPage((p) => p - 1);
  const handleNext = () => page < pageCount && setPage((p) => p + 1);
  const handleLast = () => setPage(pageCount);
  const handleGoTo = () => {
    const n = parseInt(inputPage, 10);
    if (n >= 1 && n <= pageCount) setPage(n);
    setInputPage('');
  };

  // Interpolación animación altura
  const filterHeight = filterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  return (
    <View style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <AppHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={() => {}} // No navegas a otra pantalla, buscas local
        onMenuPress={null}
        onCartPress={() => navigation.navigate('Cart')}
        onAccountPress={() => setFilterVisible(true)}
        userEmail={user?.email}
        categoryId={categoryId}
      />

      <TouchableOpacity style={styles.filterToggleBtn} onPress={toggleFilter}>
        <Text style={[styles.filterToggleText, isDarkMode ? styles.textLight : styles.textDark]}>
          {labels.filters} {filterVisible ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.filterContainer,
          { height: filterHeight, paddingHorizontal: filterVisible ? 20 : 0, paddingVertical: filterVisible ? 15 : 0, overflow: 'hidden' },
          isDarkMode ? styles.filterDark : styles.filterLight,
        ]}
      >
        {filterVisible && (
          <>
            <View style={styles.filterRow}>
              <View style={styles.filterGroup}>
                <Text
                  style={[
                    styles.label,
                    isDarkMode ? styles.textLight : styles.textDark,
                    { fontFamily: 'Roboto', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
                  ]}
                >
                  {labels.minPrice}:
                </Text>
                <TextInput
                  style={[
                    styles.filterInput,
                    isDarkMode ? styles.inputDark : styles.inputLight,
                    { fontWeight: '900', fontSize: 18, letterSpacing: 0.5, paddingVertical: 4, textAlignVertical: 'center' },
                  ]}
                  keyboardType="numeric"
                  value={priceMin}
                  onChangeText={text => {
                    setPriceMin(text.replace(/[^0-9]/g, ''));
                    setPage(1);
                  }}
                  placeholder="0"
                  placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                />
              </View>

              <View style={styles.filterGroup}>
                <Text
                  style={[
                    styles.label,
                    isDarkMode ? styles.textLight : styles.textDark,
                    { fontFamily: 'Roboto', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
                  ]}
                >
                  {labels.maxPrice}:
                </Text>
                <TextInput
                  style={[
                    styles.filterInput,
                    isDarkMode ? styles.inputDark : styles.inputLight,
                    { fontWeight: '900', fontSize: 18, letterSpacing: 0.5, paddingVertical: 4, textAlignVertical: 'center' },
                  ]}
                  keyboardType="numeric"
                  value={priceMax}
                  onChangeText={text => {
                    setPriceMax(text.replace(/[^0-9]/g, ''));
                    setPage(1);
                  }}
                  placeholder="9999"
                  placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                />
              </View>
            </View>

            <View style={styles.filterRow}>
              <Text
                style={[
                  styles.label,
                  isDarkMode ? styles.textLight : styles.textDark,
                  { fontFamily: 'Roboto', fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
                ]}
              >
                {labels.sort}:
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSortAsc(true);
                  setPage(1);
                }}
                style={[styles.sortBtn, sortAsc && styles.sortBtnSelected]}
              >
                <Text
                  style={[
                    sortAsc ? styles.sortTextSelected : styles.sortText,
                    { fontWeight: '900', color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  {labels.asc}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSortAsc(false);
                  setPage(1);
                }}
                style={[styles.sortBtn, !sortAsc && styles.sortBtnSelected]}
              >
                <Text
                  style={[
                    !sortAsc ? styles.sortTextSelected : styles.sortText,
                    { fontWeight: '900', color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  {labels.desc}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>

      {loading ? (
        <View style={[styles.center, isDarkMode ? styles.bgDark : styles.bgLight]}>
          <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={currentItems}
          keyExtractor={(i) => i.id.toString()}
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
      )}

      <View style={styles.pagination}>
        <Button title={labels.first} onPress={handleFirst} disabled={page === 1} />
        <Button title={labels.prev} onPress={handlePrev} disabled={page === 1} />
        <Text style={[styles.pageText, isDarkMode ? styles.textLight : styles.textDark]}>
          {page} / {pageCount}
        </Text>
        <Button title={labels.next} onPress={handleNext} disabled={page === pageCount} />
        <Button title={labels.last} onPress={handleLast} disabled={page === pageCount} />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: '#111' },
  bgLight: { backgroundColor: '#f2f2f2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  pagination: { flexDirection: 'row', justifyContent: 'space-between', padding: 8, alignItems: 'center' },
  pageText: { fontSize: 16, fontWeight: 'bold' },
  textDark: { color: '#000' },
  textLight: { color: '#fff' },

  gotoContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 8 },
  gotoInput: { width: 50, borderWidth: 1, marginRight: 8, textAlign: 'center' },

  filterToggleBtn: { padding: 12, backgroundColor: '#007AFF', borderRadius: 6, alignItems: 'center', marginHorizontal: 10, marginTop: 10 },
  filterToggleText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  filterContainer: { overflow: 'hidden', marginHorizontal: 10, borderRadius: 8, padding: 10 },

  filterDark: { backgroundColor: '#333' },
  filterLight: { backgroundColor: '#fff' },

  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  filterInput: { borderWidth: 1, borderRadius: 6, height: 36, paddingHorizontal: 8, minWidth: 70 },

  inputDark: { borderColor: '#555', backgroundColor: '#333', color: '#fff' },
  inputLight: { borderColor: '#ccc', backgroundColor: '#fff', color: '#000' },

  label: { fontSize: 14, marginRight: 5 },

  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginHorizontal: 4 },
  sortBtnSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  sortText: { color: '#555' },
  sortTextSelected: { color: '#fff', fontWeight: '600' },
});
