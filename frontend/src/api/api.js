const BASE_URL = '/api/products';

export const getProducts = () =>
  fetch(BASE_URL).then(r => r.json());

export const createProduct = (data) =>
  fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json());

export const deleteProduct = async (id) => {
  console.log('DELETE вызван для id:', id);
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE'
  });
  console.log('DELETE статус:', res.status);
  if (res.status === 204 || res.ok) {
    return true;
  }
  throw new Error(`Удаление не удалось: ${res.status}`);
};
