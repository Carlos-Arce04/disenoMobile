// screens/HomeScreen.js
import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export default function HomeScreen({ setIsUserVerified }) {
  const { user, logout } = useGoogleAuth();

  // Mantenemos sincronizado isUserVerified con el estado de `user`
  useEffect(() => {
    setIsUserVerified(!!user);
  }, [user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Hola, {user?.displayName || user?.email || 'Usuario'}
      </Text>
      <Button
        title="Cerrar sesión"
        onPress={() => {
          logout();
          // después del logout, el hook dejará `user` en null
        }}
      />
    </View>
  );
}
