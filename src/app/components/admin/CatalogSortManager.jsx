'use client';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { firestoreDB } from '../../../lib/firebase/config';
import { PRODUCT_CATEGORIES, CATEGORY_ALIASES } from '../../hooks/shared/useProducts';

const SORT_OPTIONS = [
  { value: 'fecha_desc', label: 'Más nuevo primero' },
  { value: 'fecha_asc', label: 'Más antiguo primero' },
  { value: 'precio_desc', label: 'Mayor precio primero' },
  { value: 'precio_asc', label: 'Menor precio primero' },
  { value: 'masVendidos', label: 'Más vendidos (requiere sincronizar)' },
  { value: 'manual', label: 'Orden manual' },
];

const ALL_SECTIONS = ['Destacados', 'Ofertas', ...PRODUCT_CATEGORIES, 'otros'];

const SECTION_LABELS = {
  Destacados: 'Destacados',
  Ofertas: 'Ofertas especiales',
  otros: 'Otros productos',
};

function getSectionProducts(section, products) {
  if (section === 'Destacados') return products.filter((p) => p.featured);
  if (section === 'Ofertas') return products.filter((p) => p.categories?.includes('Ofertas'));
  if (section === 'otros')
    return products.filter((p) => !p.featured && !p.categories?.includes('Ofertas'));
  const aliases = CATEGORY_ALIASES[section] || [];
  return products.filter(
    (p) => p.categories?.includes(section) || aliases.some((a) => p.categories?.includes(a))
  );
}

export default function CatalogSortManager({ products = [] }) {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [syncing, setSyncing] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const snap = await getDoc(doc(firestoreDB, 'config', 'catalogSort'));
        if (snap.exists()) setConfig(snap.data().sections || {});
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const persistConfig = async (newConfig) => {
    setSaving(true);
    try {
      await setDoc(doc(firestoreDB, 'config', 'catalogSort'), { sections: newConfig });
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (section, type) => {
    const prev = config[section] || {};
    const updated = { ...config, [section]: { ...prev, type } };
    setConfig(updated);
    persistConfig(updated);
  };

  const syncSalesRanking = async (section) => {
    setSyncing(section);
    try {
      const ordSnap = await getDocs(collection(firestoreDB, 'orders'));
      const productMap = new Map();
      ordSnap.docs.forEach((d) => {
        const data = d.data();
        const items =
          data.cart || data.items || data.products || data.rawData?.cart || [];
        items.forEach((it) => {
          const id = it.id || it.productId || it.sku;
          if (!id) return;
          const curr = productMap.get(id) || { quantity: 0 };
          productMap.set(id, { quantity: curr.quantity + (Number(it.quantity) || 1) });
        });
      });

      const sectionProducts = getSectionProducts(section, products);
      const ranked = [...sectionProducts]
        .sort((a, b) => {
          const qa = productMap.get(a.id)?.quantity || 0;
          const qb = productMap.get(b.id)?.quantity || 0;
          return qb - qa;
        })
        .map((p) => p.id);

      const updated =
        section === 'Destacados'
          ? { ...config, Destacados: { ...(config['Destacados'] || {}), salesRanking: ranked } }
          : { ...config, [section]: { type: 'masVendidos', salesRanking: ranked } };
      setConfig(updated);
      await persistConfig(updated);
    } catch (e) {
    } finally {
      setSyncing(null);
    }
  };

  const moveManualItem = (section, index, direction) => {
    const sectionConf = config[section] || {};
    const sectionProducts = getSectionProducts(section, products);
    const currentOrder =
      sectionConf.manualOrder?.length > 0
        ? sectionConf.manualOrder
        : sectionProducts.map((p) => p.id);
    const newOrder = [...currentOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    const updated = {
      ...config,
      [section]: { ...sectionConf, type: 'manual', manualOrder: newOrder },
    };
    setConfig(updated);
    persistConfig(updated);
  };

  const initManualOrder = (section) => {
    const sectionConf = config[section] || {};
    if (sectionConf.manualOrder?.length > 0) return; // already initialized
    const sectionProducts = getSectionProducts(section, products);
    const order = sectionProducts.map((p) => p.id);
    const updated = {
      ...config,
      [section]: { ...sectionConf, type: 'manual', manualOrder: order },
    };
    setConfig(updated);
    persistConfig(updated);
  };

  if (loading)
    return (
      <div className="p-4 text-sm text-gray-500">Cargando configuración de orden...</div>
    );

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Orden del Catálogo</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Define el criterio de ordenación de productos para cada sección del catálogo.
          </p>
        </div>
        {saving && <span className="text-xs text-gray-400">Guardando...</span>}
        {savedOk && (
          <span className="text-xs text-green-600 font-medium">✓ Guardado</span>
        )}
      </div>

      {ALL_SECTIONS.map((section) => {
        // ── Destacados: UI especial de 4 columnas ──────────────────────────
        if (section === 'Destacados') {
          const destConf = config['Destacados'] || {};
          const destCount = getSectionProducts('Destacados', products).length;
          return (
            <div key="Destacados" className="border border-gray-200 rounded-md bg-white">
              <div className="px-3 py-2 bg-gray-50 rounded-t-md">
                <span className="text-sm font-medium text-gray-700">
                  Destacados
                  <span className="ml-2 text-xs text-gray-400">
                    ({destCount} productos &middot; 4 columnas independientes)
                  </span>
                </span>
              </div>
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {/* Columna 1: Más vendidos */}
                <div className="px-3 py-2 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 w-[5.5rem]">Columna 1</span>
                    <span className="text-xs text-gray-700">Más vendidos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => syncSalesRanking('Destacados')}
                      disabled={syncing === 'Destacados'}
                      className="text-xs px-2 py-1 bg-[#5e8c30] text-white rounded hover:bg-[#4a7326] disabled:opacity-50"
                    >
                      {syncing === 'Destacados' ? 'Sincronizando...' : 'Sincronizar ventas'}
                    </button>
                    {destConf.salesRanking?.length > 0 && (
                      <span className="text-xs text-gray-400">
                        ✓ {destConf.salesRanking.length} en ranking
                      </span>
                    )}
                  </div>
                </div>
                {/* Columna 2: Más recientes (automático) */}
                <div className="px-3 py-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 w-[5.5rem]">Columna 2</span>
                  <span className="text-xs text-gray-500 italic">Más recientes (automático)</span>
                </div>
                {/* Columna 3: categoría a elegir */}
                <div className="px-3 py-2 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-500 w-[5.5rem]">Columna 3</span>
                  <select
                    value={destConf.col3Category || ''}
                    onChange={(e) => {
                      const updated = { ...config, Destacados: { ...destConf, col3Category: e.target.value } };
                      setConfig(updated);
                      persistConfig(updated);
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#9bb05b]"
                  >
                    <option value="">— Cualquier categoría —</option>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {/* Columna 4: categoría a elegir */}
                <div className="px-3 py-2 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-500 w-[5.5rem]">Columna 4</span>
                  <select
                    value={destConf.col4Category || ''}
                    onChange={(e) => {
                      const updated = { ...config, Destacados: { ...destConf, col4Category: e.target.value } };
                      setConfig(updated);
                      persistConfig(updated);
                    }}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#9bb05b]"
                  >
                    <option value="">— Cualquier categoría —</option>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        }

        // ── Resto de secciones: UI genérica ───────────────────────────────
        const sectionConf = config[section] || {};
        const type = sectionConf.type || 'fecha_desc';
        const label = SECTION_LABELS[section] || section;
        const sectionProducts = getSectionProducts(section, products);
        const isExpanded = expandedSection === section;
        const manualOrder =
          sectionConf.manualOrder?.length > 0
            ? sectionConf.manualOrder
            : sectionProducts.map((p) => p.id);

        // Build ordered list for manual
        const orderedProducts =
          type === 'manual'
            ? [
                ...manualOrder
                  .map((id) => sectionProducts.find((p) => p.id === id))
                  .filter(Boolean),
                ...sectionProducts.filter((p) => !manualOrder.includes(p.id)),
              ]
            : sectionProducts;

        return (
          <div key={section} className="border border-gray-200 rounded-md bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-t-md">
              <span className="text-sm font-medium text-gray-700">
                {label}
                <span className="ml-2 text-xs text-gray-400">
                  ({sectionProducts.length} productos)
                </span>
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={type}
                  onChange={(e) => {
                    handleTypeChange(section, e.target.value);
                    if (e.target.value === 'manual') {
                      setExpandedSection(section);
                      initManualOrder(section);
                    }
                  }}
                  className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#9bb05b]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {type === 'masVendidos' && (
                  <button
                    onClick={() => syncSalesRanking(section)}
                    disabled={syncing === section}
                    className="text-xs px-2 py-1 bg-[#5e8c30] text-white rounded hover:bg-[#4a7326] disabled:opacity-50"
                  >
                    {syncing === section ? 'Sincronizando...' : 'Sincronizar ventas'}
                  </button>
                )}

                {type === 'manual' && (
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : section)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    {isExpanded ? 'Cerrar' : 'Ordenar'}
                  </button>
                )}
              </div>
            </div>

            {/* Info banner for masVendidos */}
            {type === 'masVendidos' && (
              <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100">
                {sectionConf.salesRanking?.length > 0 ? (
                  <>
                    Ranking sincronizado con{' '}
                    <strong>{sectionConf.salesRanking.length}</strong> productos. Haz
                    clic en "Sincronizar ventas" para actualizar.
                  </>
                ) : (
                  'Haz clic en "Sincronizar ventas" para generar el ranking desde los pedidos.'
                )}
              </div>
            )}

            {/* Manual order list */}
            {type === 'manual' && isExpanded && (
              <div className="border-t border-gray-100">
                {orderedProducts.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-400">
                    No hay productos en esta sección.
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {orderedProducts.map((product, index) => (
                      <li
                        key={product.id}
                        className="flex items-center gap-2 px-3 py-1.5"
                      >
                        <span className="text-xs text-gray-400 w-5 text-right shrink-0">
                          {index + 1}.
                        </span>
                        {product.image && (
                          <img
                            src={product.image}
                            alt=""
                            className="h-8 w-8 object-cover rounded border shrink-0"
                          />
                        )}
                        <span className="text-xs text-gray-700 flex-1 truncate">
                          {product.title}
                        </span>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => moveManualItem(section, index, -1)}
                            disabled={index === 0}
                            className="px-1.5 py-0.5 text-xs border rounded disabled:opacity-30 hover:bg-gray-100"
                            title="Subir"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveManualItem(section, index, 1)}
                            disabled={index === orderedProducts.length - 1}
                            className="px-1.5 py-0.5 text-xs border rounded disabled:opacity-30 hover:bg-gray-100"
                            title="Bajar"
                          >
                            ↓
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
