export default function ProductItem({ product, onEdit, onDelete }) {
  if (!product) return <div>Ошибка загрузки товара</div>;

  const handleDelete = () => {
    if (window.confirm(`Удалить "${product.title}"?`)) {
      onDelete(product.id);
    }
  };

  return (
    <div className="menu-card">
      <h3>{product.title}</h3>
      <p><strong>Категория:</strong> {product.category}</p>
      <p>{product.description}</p>
      <p><strong>Цена:</strong> {product.price} ₽</p>
      <p><strong>Остаток:</strong> {product.stock} шт.</p>

      <div style={{ marginTop: '15px' }}>
        <button className="btn edit" onClick={() => onEdit(product)}>Редактировать</button>
        <button 
  className="btn delete" 
  onClick={() => onDelete(product.id)}
>
  Удалить
</button>
      </div>
    </div>
  );
}