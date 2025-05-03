// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import HomeScreen from './screens/HomeScreen';
import { View, Text, Button } from 'react-native';

const Stack = createStackNavigator();

// Pantalla de Login
const LoginScreen = ({ promptAsync }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 24, marginBottom: 20 }}>¡Bienvenido!</Text>
    <Button title="Iniciar sesión con Google" onPress={() => promptAsync()} />
  </View>
);

export default function App() {
  const { user, promptAsync } = useGoogleAuth();
  const [isUserVerified, setIsUserVerified] = useState(false);

  // Cada vez que cambie `user`, actualizamos el estado de verificación
  useEffect(() => {
    setIsUserVerified(!!user);
  }, [user]);

  return (
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
          <Stack.Screen name="Home" options={{ title: 'Home' }}>
            {props => (
              <HomeScreen
                {...props}
                setIsUserVerified={setIsUserVerified}
              />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
