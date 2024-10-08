"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Only use the router for navigation
import ProductList from "./components/ProductList";
import SearchBar from "./components/searchBar";
import SortOptions from "./components/SortOptions";
import CategoryFilter from "./components/CategoryFilter";
import { fetchProducts } from "./lib/fetchProducts";
import { fetchCategories } from "./lib/fecthCategories";
import Header from "./components/Header";

// Fallback component for loading state
const Loading = () => <div>Loading...</div>;

export default function Home() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Extract query parameters from the URL manually
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("search") || "");
    setSort(params.get("sort") || "");
    setCategory(params.get("category") || "");
    setPage(parseInt(params.get("page") || "1", 10));
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const fetchedProducts = await fetchProducts(page, search, sort, category);
      setProducts(fetchedProducts);
      setLoading(false);
    };

    // Load products whenever the search, sort, category, or page changes
    loadProducts();
  }, [page, search, sort, category]);

  const handlePagination = (newPage) => {
    if (!loading) {
      const params = new URLSearchParams(window.location.search);
      params.set("page", newPage.toString());
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.push(newUrl); // Navigate to the new URL
      setPage(newPage); // Update state manually
    }
  };

  const handleReset = () => {
    router.push("/"); // Reset URL to default without filters
  };

  return (
    <>
      <Header
        title="Discover Amazing Products"
        description="Browse our product catalog"
      />

      <Suspense fallback={<Loading />}>
        <section className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Discover Amazing Products
          </h1>

          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
              <div className="w-full md:w-1/3">
                <SearchBar initialSearchTerm={search} />
              </div>
              <div className="w-full md:w-1/3">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={category}
                />
              </div>
              <div className="w-full md:w-1/3">
                <SortOptions selectedSort={sort} />
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
            >
              Reset All Filters
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductList key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-xl text-gray-600 mt-8">
              No products available.
            </p>
          )}

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => handlePagination(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && page > 1 ? "Loading..." : "Previous"}
            </button>
            <span className="font-semibold text-gray-700">Page {page}</span>
            <button
              onClick={() => handlePagination(page + 1)}
              disabled={products.length < 20 || loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && products.length === 20 ? "Loading..." : "Next"}
            </button>
          </div>
        </section>
      </Suspense>

      <footer className="bg-white shadow-md dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © 2024 NEXTY E-Commerce. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
