import React, { useContext, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { CartContext } from '../backend/CartContext';
import ProductCard from '../components/ProductCard';
import { ThemeContext } from '../ThemeContext';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const NUM_COLUMNS_WEB = 4;
const NUM_COLUMNS_MOBILE = 2;
const MARGIN_WEB = 10;
const MARGIN_MOBILE = 8;

const NUM_COLUMNS = isWeb ? NUM_COLUMNS_WEB : NUM_COLUMNS_MOBILE;
const MARGIN = isWeb ? MARGIN_WEB : MARGIN_MOBILE;
const baseCardWidth = (width - (NUM_COLUMNS + 1) * MARGIN) / NUM_COLUMNS;
const cardWidth = isWeb ? baseCardWidth : baseCardWidth * 0.9;

export default function CartScreen({ navigation }) {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const { isDarkMode, language } = useContext(ThemeContext);

  useLayoutEffect(() => {
    navigation.setOptions({ title: language === 'es' ? 'Mi Carrito' : 'My Cart' });
  }, [language, navigation]);

  const renderEmpty = () => (
    <View
      style={[
        styles.center,
        isDarkMode ? styles.darkBg : styles.lightBg,
        { paddingHorizontal: 20 }
      ]}
    >
      <Text
        style={[
          styles.emptyText,
          isDarkMode ? styles.darkText : styles.lightText,
          { minWidth: 180, textAlign: 'center', flexWrap: 'wrap', flexShrink: 1 }
        ]}
      >
        {language === 'es' ? 'Tu carrito está vacío.' : 'Your cart is empty.'}
      </Text>
    </View>
  );

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={[styles.container, isDarkMode ? styles.darkBg : styles.lightBg]}>
      {cartItems.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={item => item.key}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={{ padding: MARGIN }}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: MARGIN }}
            renderItem={({ item }) => {
              const images = Array.isArray(item.images) && item.images.length > 0
                ? item.images
                : item.image
                  ? [item.image]
                  : [];
              const productForCard = { ...item, images };
              return (
                <View style={{ width: cardWidth, margin: MARGIN / 2 }}>
                  <ProductCard
                    product={productForCard}
                    categoryId={item.categoryId}
                    cardWidth={cardWidth}
                    margin={0}
                    onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                  />

                  <View style={styles.qtyContainer}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.categoryId, item.size, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Text style={[styles.qtyBtn, isDarkMode ? styles.darkText : styles.lightText]}>-</Text>
                    </TouchableOpacity>
                    <TextInput
                      value={String(item.quantity)}
                      style={[
                        styles.qtyInput,
                        { color: isDarkMode ? '#fff' : '#000' },
                        { borderColor: isDarkMode ? '#555' : '#ccc' }
                      ]}
                      editable={false}
                    />
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.categoryId, item.size, 1)}
                    >
                      <Text style={[styles.qtyBtn, isDarkMode ? styles.darkText : styles.lightText]}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => removeFromCart(item.id, item.size)}
                    style={styles.removeBtn}
                  >
                    <Text style={[styles.removeBtnText, isDarkMode ? styles.darkText : styles.lightText]}>
                      {language === 'es' ? 'Eliminar' : 'Remove'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />

          <View style={[styles.summary, { borderTopColor: isDarkMode ? '#555' : '#ccc' }]}>
            <Text style={[styles.totalText, isDarkMode ? styles.darkText : styles.lightText]}>
              {language === 'es' ? 'Total:' : 'Total:'} ${total.toFixed(2)}
            </Text>
            <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
              <Text style={[styles.clearText, isDarkMode ? styles.darkText : styles.lightText]}>
                {language === 'es' ? 'Vaciar carrito' : 'Clear Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lightBg: { backgroundColor: '#f2f2f2' },
  darkBg: { backgroundColor: '#111' },
  lightText: { color: '#000' },
  darkText: { color: '#fff' },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  qtyBtn: { fontSize: 20, paddingHorizontal: 10 },
  qtyInput: { borderWidth: 1, width: 40, textAlign: 'center', marginHorizontal: 8, borderRadius: 4, backgroundColor: 'transparent' },
  removeBtn: { marginTop: 8, alignSelf: 'center' },
  removeBtnText: { fontSize: 14 },
  summary: { padding: 16, borderTopWidth: 1, alignItems: 'center' },
  totalText: { fontSize: 18, fontWeight: 'bold' },
  clearBtn: { marginTop: 8 },
  clearText: { fontSize: 16 }
});
