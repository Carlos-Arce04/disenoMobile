// screens/ProductDetailScreen.js
import React, { useEffect, useState, useContext, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { getProductById } from '../backend/platziapi';
import { translateText } from '../backend/translate';
import { ThemeContext } from '../ThemeContext';
import { CartContext } from '../backend/CartContext';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width;  // cuadrado para que se vea completa

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const { isDarkMode, language } = useContext(ThemeContext);
  const {
    cartItems,
    stocks,
    addToCart,
    updateQuantity,
    initializeStock,
    SIZED_CATEGORIES,
    SIZE_SETS
  } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState(null);
  const [editing, setEditing] = useState(false);
  const [page, setPage] = useState(0);

  const texts = {
    title:        language === 'es' ? 'Detalle de Producto' : 'Product Detail',
    selectSize:   language === 'es' ? 'Selecciona talla:' : 'Select size:',
    outOfStock:   language === 'es' ? 'Sin stock'         : 'Out of stock',
    noProduct:    language === 'es' ? 'Producto no encontrado' : 'Product not found',
    quantity:     language === 'es' ? 'Cantidad:'         : 'Quantity:'
  };

  useLayoutEffect(() => {
    navigation.setOptions({ title: texts.title });
  }, [language]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getProductById(productId);
        await initializeStock(productId, data.category.id);
        if (language !== 'en') {
          data.title       = await translateText(data.title,       'en', language);
          data.description = data.description
            ? await translateText(data.description, 'en', language)
            : data.description;
        }
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId, language]);

  if (loading) return <LoadingScreen isDarkMode={isDarkMode} />;
  if (!product) return <NotFoundScreen isDarkMode={isDarkMode} message={texts.noProduct} />;

  const isSized = SIZED_CATEGORIES.includes(product.category.id);
  const availableStocks = stocks[productId] || {};
  const key = `${productId}_${size || 'default'}`;
  const entry = cartItems.find(i => i.key === key) || { quantity: 0 };
  const quantity = entry.quantity;

  const images = product.images.length ? product.images : [product.image];

  const handleAdd = async () => {
    if (isSized && !size) {
      // obliga a elegir talla
      return setEditing(false);
    }
    const ok = await addToCart(
      { id: product.id, title: product.title, price: product.price },
      product.category.id,
      size || 'default'
    );
    if (!ok) {
      alert(texts.outOfStock);
    } else {
      setEditing(true);
    }
  };

  return (
    <ScrollView style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>
      {/* Carrusel cuadrado */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={e => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={styles.carousel}
      >
        {images.map((uri, idx) => (
          <Image
            key={idx}
            source={{ uri }}
            style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, resizeMode: 'cover' }}
          />
        ))}
      </ScrollView>
      <View style={styles.pageIndicator}>
        <Text style={isDarkMode ? styles.darkText : styles.lightText}>
          {page + 1} / {images.length}
        </Text>
      </View>

      <View style={styles.details}>
        <Text style={[styles.title,   isDarkMode ? styles.darkText : styles.lightText]}>
          {product.title}
        </Text>
        <Text style={[styles.price,   isDarkMode ? styles.darkText : styles.lightText]}>
          ${product.price}
        </Text>
        <Text style={[styles.desc,    isDarkMode ? styles.darkText : styles.lightText]}>
          {product.description}
        </Text>

        {/* Selector de tallas */}
        {isSized && !editing && (
          <View style={styles.sizeSection}>
            <Text style={[styles.subTitle, isDarkMode ? styles.darkText : styles.lightText]}>
              {texts.selectSize}
            </Text>
            <View style={styles.sizeContainer}>
              {SIZE_SETS[product.category.id].map(sz => {
                const stock = availableStocks[sz] || 0;
                return (
                  <TouchableOpacity
                    key={sz}
                    disabled={stock === 0}
                    onPress={() => { setSize(sz); setEditing(false); }}
                    style={[
                      styles.sizeBtn,
                      size === sz          && styles.sizeBtnSelected,
                      stock === 0          && styles.sizeBtnDisabled
                    ]}
                  >
                    <Text style={[
                      styles.sizeText,
                      isDarkMode ? styles.darkText : styles.lightText,
                      size === sz          && styles.sizeTextSelected,
                      stock === 0          && styles.sizeTextDisabled
                    ]}>
                      {sz} ({stock})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Botón carrito (imagen) */}
        {!editing && (
          <TouchableOpacity style={styles.cartBtn} onPress={handleAdd}>
            <Image
              source={require('../assets/cart.png')}
              style={[styles.cartIcon, isDarkMode ? styles.tintDark : styles.tintLight]}
            />
          </TouchableOpacity>
        )}

        {/* Controles cantidad */}
        {editing && (
          <View style={styles.qtySection}>
            <TouchableOpacity
              onPress={() => { setEditing(false); setSize(null); }}
            >
              <Text style={styles.checkBtn}>✅</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updateQuantity(productId, product.category.id, size, -1)}
            >
              <Text style={[styles.qtyBtn, isDarkMode ? styles.darkText : styles.lightText]}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.qtyCount, isDarkMode ? styles.darkText : styles.lightText]}>
              {quantity}
            </Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={[styles.qtyBtn, isDarkMode ? styles.darkText : styles.lightText]}>＋</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function LoadingScreen({ isDarkMode }) {
  return (
    <View style={[styles.center, isDarkMode ? styles.darkBg : styles.lightBg]}>
      <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
    </View>
  );
}

function NotFoundScreen({ isDarkMode, message }) {
  return (
    <View style={[styles.center, isDarkMode ? styles.darkBg : styles.lightBg]}>
      <Text style={isDarkMode ? styles.darkText : styles.lightText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  darkBg:         { backgroundColor: '#111' },
  lightBg:        { backgroundColor: '#f2f2f2' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  carousel:       { flexGrow: 0 },
  pageIndicator:  { alignItems: 'center', marginVertical: 8 },
  details:        { padding: 16 },
  title:          { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  price:          { fontSize: 20, marginBottom: 12 },
  desc:           { fontSize: 16, lineHeight: 22, marginBottom: 16 },
  sizeSection:    { marginBottom: 16 },
  subTitle:       { fontSize: 14, marginBottom: 8 },
  sizeContainer:  { flexDirection: 'row', flexWrap: 'wrap' },
  sizeBtn:        { padding: 6, borderWidth: 1, borderColor: '#999', borderRadius: 4, marginRight: 8, marginBottom: 8 },
  sizeBtnSelected:{ borderColor: '#007AFF' },
  sizeBtnDisabled:{ borderColor: '#ccc', backgroundColor: '#f2f2f2' },
  sizeText:       { fontSize: 14 },
  sizeTextSelected:{ color: '#007AFF', fontWeight: '600' },
  sizeTextDisabled:{ color: '#999' },
  cartBtn:        { alignSelf: 'center', marginBottom: 16 },
  cartIcon:       { width: 48, height: 48 },
  tintDark:       { tintColor: '#fff' },
  tintLight:      { tintColor: '#000' },
  qtySection:     { flexDirection: 'row', alignItems: 'center' },
  checkBtn:       { fontSize: 24, marginRight: 16 },
  qtyBtn:         { fontSize: 24, marginHorizontal: 16 },
  qtyCount:       { fontSize: 18, minWidth: 32, textAlign: 'center' },
  darkText:       { color: '#fff' },
  lightText:      { color: '#000' }
});