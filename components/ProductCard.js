import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from 'react-native';
import { CartContext } from '../backend/CartContext';
import { ThemeContext } from '../ThemeContext';

export default function ProductCard({ product, categoryId, onPress, cardWidth, margin }) {
  const {
    cartItems,
    stocks,
    addToCart,
    updateQuantity,
    initializeStock,
    SIZED_CATEGORIES,
    SIZE_SETS
  } = useContext(CartContext);
  const { language } = useContext(ThemeContext);

  const isSized = SIZED_CATEGORIES.includes(categoryId);
  const [size, setSize] = useState(isSized ? null : 'default');
  const [editing, setEditing] = useState(false);

  const texts = {
    selectSize: language === 'es' ? 'Selecciona talla:' : 'Select size:',
    outOfStockTitle: language === 'es' ? 'Sin stock' : 'Out of stock',
    outOfStockMsg: language === 'es'
      ? 'Lo sentimos, no hay más unidades disponibles para este tamaño.'
      : "Sorry, there are no more units available for this size.",
  };

  useEffect(() => {
    initializeStock(product.id, categoryId);
  }, [product.id, categoryId]);

  const availableStocks = stocks[product.id] || {};
  const key = `${product.id}_${size}`;
  const entry = cartItems.find(i => i.key === key);
  const quantity = entry ? entry.quantity : 0;

  const handleAdd = async () => {
    if (isSized && !size) {
      setEditing(true);
      return;
    }
    const ok = await addToCart(
      { id: product.id, title: product.title, price: product.price },
      categoryId,
      size
    );
    if (!ok) {
      Alert.alert(texts.outOfStockTitle, texts.outOfStockMsg, [{ text: 'OK' }]);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, cardWidth && { width: cardWidth }, margin && { margin }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Carrito posicionado sobre la imagen */}
      {!editing && (
        <TouchableOpacity style={styles.cartBtn} onPress={() => setEditing(true)}>
          <Image source={require('../assets/cart.png')} style={styles.cartIconImage} />
        </TouchableOpacity>
      )}

      <Image
        source={{
          uri:
            Array.isArray(product.images) && product.images.length
              ? product.images[0]
              : product.image
        }}
        style={styles.image}
      />

      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.title}>
          {product.title}
        </Text>
        <Text style={styles.price}>${product.price}</Text>

        {editing && (
          <>
            {/* Selector de tallas si aplica */}
            {isSized && size === null && (
              <View style={styles.sizeContainer}>
                <Text style={styles.subTitle}>{texts.selectSize}</Text>
                {SIZE_SETS[categoryId].map(sz => {
                  const stock = availableStocks[sz] ?? 0;
                  return (
                    <TouchableOpacity
                      key={sz}
                      onPress={() => stock > 0 && setSize(sz)}
                      disabled={stock <= 0}
                      style={[
                        styles.sizeBtn,
                        size === sz && styles.sizeBtnSelected,
                        stock <= 0 && styles.sizeBtnDisabled
                      ]}
                    >
                      <View style={styles.sizeTextWrapper}>
                        <Text
                          style={[
                            styles.sizeText,
                            size === sz && styles.sizeTextSelected,
                            stock <= 0 && styles.sizeTextDisabled,
                          ]}
                          allowFontScaling={false}
                        >
                          {sz}
                        </Text>
                        <Text
                          style={[
                            styles.stockText,
                            stock <= 0 && styles.sizeTextDisabled,
                            size === sz && styles.sizeTextSelected,
                          ]}
                          allowFontScaling={false}
                        >
                          ({stock})
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Controles de cantidad */}
            <View style={styles.qtyControl}>
              <TouchableOpacity
                onPress={() => {
                  setEditing(false);
                  setSize(isSized ? null : 'default');
                }}
              >
                <Text style={styles.checkBtn}>✅</Text>
              </TouchableOpacity>

              {quantity > 0 && (
                <TouchableOpacity
                  onPress={async () => {
                    await updateQuantity(product.id, categoryId, size, -1);
                    if (quantity - 1 <= 0) {
                      setEditing(false);
                      setSize(isSized ? null : 'default');
                    }
                  }}
                >
                  <Text style={styles.qtyBtn}>−</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.qtyText}>{quantity}</Text>

              <TouchableOpacity onPress={handleAdd}>
                <Text style={styles.qtyBtn}>＋</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'flex-start'  // fuerza a no estirarse en altura
  },
  cartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    backgroundColor: '#e0e0e0', // fondo grisáceo
    borderRadius: 16,
    padding: 4
  },
  cartIcon: {
    // oculto, ahora usamos imagen
  },
  cartIconImage: {
    width: 24,
    height: 24,
    tintColor: '#000' // color negro
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover'
  },
  info: {
    padding: 8
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8
  },
  subTitle: {
    width: '100%',
    fontSize: 12,
    marginBottom: 4
  },
  sizeBtn: {
    paddingHorizontal: 12,   // Aumentado para más espacio horizontal
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6
  },
  sizeBtnSelected: {
    borderColor: '#007AFF'
  },
  sizeBtnDisabled: {
    borderColor: '#ccc',
    backgroundColor: '#f2f2f2'
  },
  sizeTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,        // Evita que el contenedor se reduzca y corte texto
    justifyContent: 'flex-start',
  },
  sizeText: {
    fontSize: 12,
    flexShrink: 0,        // No permite que se reduzca el texto
  },
  stockText: {
    fontSize: 12,
    marginLeft: 4,
    flexShrink: 0,        // No permite que se reduzca ni corte el paréntesis
    minWidth: 20,         // Ancho mínimo para el stock entre paréntesis
    paddingRight: 2,      // Espacio para evitar corte
  },
  sizeTextSelected: {
    color: '#007AFF',
    fontWeight: '600'
  },
  sizeTextDisabled: {
    textDecorationLine: 'line-through',
    color: '#999'
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  checkBtn: {
    fontSize: 20,
    marginRight: 12
  },
  qtyBtn: {
    fontSize: 20,
    marginHorizontal: 12
  },
  qtyText: {
    fontSize: 16,
    minWidth: 24,
    textAlign: 'center'
  }
});
