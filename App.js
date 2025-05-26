// App.js
import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import HomeScreen from './screens/HomeScreen';
import SearchScreen from './screens/SearchScreen';
import CategoriesDetailScreen from './screens/CategoriesDetailScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import CartScreen from './screens/CartScreen';
import { View, Text, Button, StyleSheet } from 'react-native';
import { CartProvider } from './backend/CartContext';

const Stack = createStackNavigator();

const LoginScreen = ({ promptAsync }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 24, marginBottom: 20 }}>¡Bienvenido!</Text>
    <Button title="Iniciar sesión con Google" onPress={() => promptAsync()} />
  </View>
);

export default function App() {
  const { user, promptAsync } = useGoogleAuth();
  const [isUserVerified, setIsUserVerified] = useState(false);

  useEffect(() => {
    setIsUserVerified(!!user);
  }, [user]);

  return (
    <ThemeProvider>
      <CartProvider user={user}>
        <NavigationContainer>
          <Stack.Navigator>
            {!isUserVerified ? (
              <Stack.Screen
                name="Login"
                options={{ headerShown: false }}
              >
                {() => <LoginScreen promptAsync={promptAsync} />}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen
                  name="Home"
                  options={{
                    headerTitle: () => (
                      <Text style={styles.appTitle}>
                        Pick <Text style={styles.appTitleAccent}>&</Text> Flick
                      </Text>
                    ),
                    headerStyle: {
                      backgroundColor: '#ffffff',
                      shadowColor: '#000',
                      shadowOpacity: 0.05,
                      shadowRadius: 10,
                      elevation: 6
                    }
                  }}
                >
                  {props => (
                    <HomeScreen
                      {...props}
                      setIsUserVerified={setIsUserVerified}
                    />
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="Search"
                  component={SearchScreen}
                  options={{ title: 'Buscar Productos' }}
                />

                <Stack.Screen
                  name="CategoriesDetail"
                  component={CategoriesDetailScreen}
                  options={({ route }) => ({ title: route.params.categoryName })}
                />

                <Stack.Screen
                  name="ProductDetail"
                  component={ProductDetailScreen}
                  options={{ title: 'Detalle de Producto' }}
                />

                <Stack.Screen
                  name="Cart"
                  component={CartScreen}
                  options={{ title: 'Mi Carrito' }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  appTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 1
  },
  appTitleAccent: {
    color: '#FF6C00'
  }
});
