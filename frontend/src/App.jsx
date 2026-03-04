import { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import ProductModal from './components/ProductModal';
import { getProducts } from './api/api';
import './styles/main.scss';

function App() {
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      alert('Не удалось загрузить меню кофейни');
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openModal = (product = null) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
  if (!window.confirm('Удалить позицию?')) return;

  try {
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  } catch (err) {
    console.error('Ошибка удаления:', err);
    alert('Не удалось удалить позицию');
  }
};

  return (
    <div className="app">
      <header>
        <h1> Кофейня </h1>
      </header>

      <button className="btn add" onClick={() => openModal()}>
        + Добавить позицию в меню
      </button>

      <ProductList
        products={products}
        onEdit={openModal}
        onDelete={handleDelete}
      />

      <ProductModal
        open={modalOpen}
        product={editingProduct}
        onClose={closeModal}
        onSave={loadProducts}
      />
    </div>
  );
}

export default App;