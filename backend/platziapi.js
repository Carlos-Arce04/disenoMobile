import axios from 'axios';

// Esta API pública de Platzi no requiere API_KEY
const BASE_URL = 'https://api.escuelajs.co/api/v1';
const api = axios.create({ baseURL: BASE_URL });

const PAGE_SIZE = 6;

/**
 * Obtener productos paginados.
 * @param {number} page — número de página (inicia en 1).
 * @returns {Promise<any[]>} Array de productos.
 */
export const getProducts = async (page = 1) => {
  const offset = (page - 1) * PAGE_SIZE;
  try {
    const response = await api.get('/products', {
      params: { offset, limit: PAGE_SIZE }
    });
    return response.data; // array de productos
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

/**
 * Obtener detalle de un producto por ID.
 * @param {number|string} productId — ID del producto.
 * @returns {Promise<Object>} Datos del producto.
 */
export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalle del producto:', error);
    throw error;
  }
};

/**
 * Obtener todas las categorías.
 * @returns {Promise<any[]>} Array de categorías.
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

/**
 * Obtener productos por categoría, paginados.
 * @param {number|string} categoryId — ID de la categoría.
 * @param {number} page — número de página (inicia en 1).
 * @returns {Promise<any[]>} Array de productos.
 */
export const getProductsByCategory = async (categoryId, page = 1) => {
  const offset = (page - 1) * PAGE_SIZE;
  try {
    const response = await api.get('/products', {
      params: { categoryId, offset, limit: PAGE_SIZE }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    throw error;
  }
};

/**
 * Buscar productos por texto, paginados.
 * @param {string} query — texto de búsqueda.
 * @param {number} page — número de página (inicia en 1).
 * @returns {Promise<any[]>} Array de productos.
 */
export const searchProducts = async (query, page = 1) => {
  const offset = (page - 1) * PAGE_SIZE;
  try {
    const response = await api.get('/products', {
      params: { title: query, offset, limit: PAGE_SIZE }
    });
    return response.data;
  } catch (error) {
    console.error('Error al buscar productos:', error);
    throw error;
  }
};

/**
 * Obtener los N productos más caros de entre las primeras M páginas.
 * @param {number} pages — cuántas páginas cargar.
 * @param {number} topN — cuántos productos devolver.
 * @returns {Promise<any[]>} Array de los productos más caros.
 */
export const getMostExpensiveProducts = async (pages = 5, topN = PAGE_SIZE) => {
  try {
    let all = [];
    for (let p = 1; p <= pages; p++) {
      const data = await getProducts(p);
      all = all.concat(data);
    }
    all.sort((a, b) => b.price - a.price);
    return all.slice(0, topN);
  } catch (error) {
    console.error('Error al obtener productos caros:', error);
    throw error;
  }
};