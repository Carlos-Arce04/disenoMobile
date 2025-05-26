// backend/translate.js
import axios from 'axios';

// Función para traducir un fragmento de texto usando MyMemory API
const translateChunk = async (chunk, sourceLang = 'en', targetLang = 'es') => {
  try {
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: chunk,
        langpair: `${sourceLang}|${targetLang}`
      }
    });
    if (
      response.data &&
      response.data.responseData &&
      response.data.responseData.translatedText
    ) {
      return response.data.responseData.translatedText;
    }
    throw new Error('No se obtuvo traducción');
  } catch (error) {
    console.error('Error en la traducción con MyMemory:', error.response?.data || error.message);
    throw error;
  }
};

// Divide texto en fragmentos que no superen maxLength (sin cortar palabras)
const splitText = (text, maxLength = 500) => {
  const words = text.split(' ');
  const chunks = [];
  let current = '';

  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (test.length > maxLength) {
      chunks.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) chunks.push(current);
  return chunks;
};

// Traduce texto completo por fragmentos
export const translateText = async (text, sourceLang = 'en', targetLang = 'es') => {
  const chunks = splitText(text, 500);
  const translations = await Promise.all(
    chunks.map(chunk => translateChunk(chunk, sourceLang, targetLang))
  );
  return translations.join(' ');
};
