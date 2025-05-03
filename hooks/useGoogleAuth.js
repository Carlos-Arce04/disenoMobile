// hooks/useGoogleAuth.js
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { signInWithCredential, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Ajusta la ruta si tu firebaseConfig.js está en otra carpeta

WebBrowser.maybeCompleteAuthSession();

// Fallbacks para almacenamiento seguro
async function getItem(key) {
  if (Platform.OS === 'web') {
    return sessionStorage.getItem(key);
  } else {
    return SecureStore.getItemAsync(key);
  }
}

async function setItem(key, value) {
  if (Platform.OS === 'web') {
    sessionStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function removeItem(key) {
  if (Platform.OS === 'web') {
    sessionStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export function useGoogleAuth() {
  const [user, setUser] = useState(null);

  // Configura los IDs para web, Android e iOS
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '850462410219-bv4gof0n6fq1l02tjtjcdt9l2n859cc2.apps.googleusercontent.com',
    androidClientId: '850462410219-g69laoo2hq5okka07p3qocul00dlh70n.apps.googleusercontent.com',
    iosClientId: '850462410219-9ct7d5ne7dk2nabhds2mkedmoq1slr5m.apps.googleusercontent.com',
    redirectUri: makeRedirectUri({
      native: makeRedirectUri(),
      useProxy: true,
    }),
    scopes: ['profile', 'email'],
  });

  // Debug: imprime la URI de redirección
  useEffect(() => {
    const uri = makeRedirectUri({ native: makeRedirectUri(), useProxy: true });
    console.log('Redirect URI:', uri);
  }, []);

  // Carga el usuario almacenado (si existe)
  useEffect(() => {
    (async () => {
      try {
        const storedUser = await getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Error cargando usuario:', e);
      }
    })();
  }, []);

  // Maneja la respuesta de Google y autentica en Firebase
  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      const { idToken, accessToken } = response.authentication;
      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      signInWithCredential(auth, credential)
        .then(({ user }) => {
          setUser(user);
          setItem('user', JSON.stringify(user));
          console.log('Usuario autenticado:', user.email);
        })
        .catch(err => console.error('Error en Firebase Auth:', err));
    }
  }, [response]);

  // Debug: estado actual de user
  useEffect(() => {
    console.log('Estado de user en hook:', user);
  }, [user]);

  // Función para cerrar sesión
  const logout = async () => {
    try {
      await removeItem('user');
      await signOut(auth);
      setUser(null);
      console.log('Sesión cerrada');
    } catch (e) {
      console.error('Error en logout:', e);
    }
  };

  return { user, promptAsync, logout };
}
