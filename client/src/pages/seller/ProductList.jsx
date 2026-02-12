import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";
import axios from 'axios'

function ProductList() {
  const { products, currency, axios, fetchProducts } = useAppContext();
  const [editState, setEditState] = useState({}); // { productId: {value, editing} }

  const handleEdit = (id, quantity) => {
    setEditState((prev) => ({
      ...prev,
      [id]: { value: quantity, editing: true },
    }));
  };

  const handleChange = (id, value) => {
    setEditState((prev) => ({
      ...prev,
      [id]: { ...prev[id], value },
    }));
  };

  const handleCancel = (id, quantity) => {
    setEditState((prev) => ({
      ...prev,
      [id]: { value: quantity, editing: false },
    }));
  };
const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  try {
    const { data } = await axios.post("/api/product/delete", { id });

    if (data.success) {
      toast.success(data.message);
      fetchProducts();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};

  const handleUpdate = async (id) => {
    try {
      const { value } = editState[id];
      const { data } = await axios.post("/api/product/stock", {
        id,
        quantity: parseInt(value, 10),
      });
      if (data.success) {
        toast.success("Quantity updated");
        setEditState((prev) => ({
          ...prev,
          [id]: { ...prev[id], editing: false },
        }));
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <div className="w-full md:p-10 p-4">
        <h2 className="pb-4 text-lg font-medium">All Products</h2>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Product</th>
                <th className="px-4 py-3 font-semibold truncate">Category</th>
                <th className="px-4 py-3 font-semibold truncate hidden md:block">Selling Price</th>
                <th className="px-4 py-3 font-semibold truncate">Quantity</th>
                <th className="px-4 py-3 font-semibold truncate text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {products.map((product) => {
                const state = editState[product._id] || {
                  value: product.quantity,
                  editing: false,
                };

                return (
                  <tr key={product._id} className="border-t border-gray-500/20">
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                      <div className="border border-gray-300 rounded overflow-hidden">
                        <img src={product.images[0]} alt="Product" className="w-16" />
                      </div>
                      <span className="truncate max-sm:hidden w-full">{product.name}</span>
                    </td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3 max-sm:hidden">
                      {currency}
                      {product.offerPrice}
                    </td>

                    

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={state.value}
                          onChange={(e) => handleChange(product._id, e.target.value)}
                          onFocus={() => handleEdit(product._id, product.quantity)}
                          className="w-20 px-2 py-1 border border-gray-400 rounded outline-none text-center"
                        />
                        {state.editing && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(product._id)}
                              className="px-3 py-1 bg-primary hover:bg-primary-dull text-white cursor-pointer rounded-[5px]"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleCancel(product._id, product.quantity)}
                              className="px-3 py-1 bg-gray-500 text-white rounded-[5px] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
  <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700 cursor-pointer">
   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
  </button>
</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProductList;
