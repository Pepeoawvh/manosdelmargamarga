import { PRODUCT_CATEGORIES } from '../../hooks/shared/useProducts';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  return (
    <select
      value={selectedCategory}
      onChange={(e) => onCategoryChange(e.target.value)}
      className="py-1 px-2 text-xs border border-gray-300 rounded bg-white"
    >
      <option value="">Todas las categorías</option>
      {PRODUCT_CATEGORIES.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
};

export default CategoryFilter;