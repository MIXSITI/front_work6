import ProductItem from './ProductItem';

export default function ProductList({ products, onEdit, onDelete }) {
  return (
    <div className="product-grid">
      {products.length === 0 ? (
        <p>Меню пустое. Добавьте первую позицию!</p>
      ) : (
        products.map(product => (
          <ProductItem
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}