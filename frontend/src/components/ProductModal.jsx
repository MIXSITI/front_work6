import { useState, useEffect } from 'react';

export default function ProductModal({ open, product, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    stock: ''
  });

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title,
        category: product.category,
        description: product.description,
        price: product.price,
        stock: product.stock
      });
    } else {
      setForm({ title: '', category: '', description: '', price: '', stock: '' });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock)
    };

    try {
      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        onSave();
        onClose();
      } else {
        alert('Ошибка при сохранении');
      }
    } catch (err) {
      alert('Не удалось сохранить позицию');
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{product ? 'Редактировать' : 'Новая позиция'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Название"
            required
          />
          <input
            name="category"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            placeholder="Категория"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Описание"
            required
          />
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            placeholder="Цена"
            required
          />
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={e => setForm({ ...form, stock: e.target.value })}
            placeholder="Остаток"
            required
          />

          <div className="modal-buttons">
            <button type="submit" className="btn primary">Сохранить</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
}
