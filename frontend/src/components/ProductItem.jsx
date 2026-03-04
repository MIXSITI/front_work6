export default function ProductItem({ product, onEdit, onDelete }) {
  if (!product) return <div>Ошибка загрузки товара</div>;

  return (
    <div className="menu-card">
      <h3>{product.title}</h3>
      <p><strong>Категория:</strong> {product.category}</p>
      <p>{product.description}</p>
      <p><strong>Цена:</strong> {product.price} ₽</p>
      <p><strong>Остаток:</strong> {product.stock} шт.</p>

      {/* ← ЭТОТ div нужен для стилей */}
      <div className="menu-card__actions">
        <button className="btn edit" onClick={() => onEdit(product)}>
          Редактировать
        </button>
        <button className="btn delete" onClick={() => onDelete(product.id)}>
          Удалить
        </button>
      </div>
    </div>
  );
}

