"use client";

import React, { useState } from "react";
import { PackagePlus, Ellipsis } from "lucide-react";
import Modal from "../ui/Modal";
import StockRegisterForm from "./StockRegisterForm";
import AddStockForm from "./AddStockForm";
import StockDelete from "./StockDelete";
import useAuth from "@/hooks/useAuth";

export default function Stock({ stocks, setSelectedStock, setActiveTab, setStkRefId, fetchStocks, loading, error })   {
  const [openStockForm, setOpenStockForm] = useState(false);
  const [openAddStockForm, setOpenAddStockForm] = useState(false);
  const [selectedStockToAdd, setSelectedStockToAdd] = useState(null);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [openDeleteStock, setOpenDeleteStock] = useState(null);

  
  const { user } = useAuth();

  return (
    <>
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Supplies Inventory</h1>
        <button className="btn btn-neutral px-8" onClick={() => setOpenStockForm(true)}>
          <PackagePlus className="size-[1.2em] mr-2" /> Register Stock
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[500px] min-h-[300px] h-1/2 overflow-y-scroll border border-base-300 rounded-md mt-10">
        <table className="table w-full text-sm">
          <thead className="sticky top-0 bg-base-300 z-10">
            <tr>
              <th className="whitespace-nowrap">Stock No</th>
              <th className="whitespace-nowrap">Article</th>
              <th className="whitespace-nowrap">Description</th>
              <th className="whitespace-nowrap">Unit</th>
              <th className="whitespace-nowrap">Balance</th>
              <th className="whitespace-nowrap">Remarks</th>
              <th className="whitespace-nowrap text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center italic py-4 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center italic py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : stocks.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center italic py-4 text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              stocks.map((stock) => (
                <tr key={stock.stockId} className="hover">
                  <td>{stock.stockNo}</td>
                  <td>{stock.article}</td>
                  <td>{stock.description}</td>
                  <td>{stock.unitMeasure}</td>
                  <td>{stock.stockBalance ?? '-'}</td>
                  <td>{stock.remarks || '-'}</td>
                  <td className="text-center">
                    {user?.username === "Marvz" ? (
                    // ✅ Full dropdown for Marvz
                      <div className="dropdown dropdown-end relative text-base-content">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                          <Ellipsis className="size-[1.2em]" />
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu bg-base-100 rounded-box z-[1000] absolute top-full right-0 w-28 p-2 shadow text-sm"
                        >
                          <li>
                            <button
                                onClick={() => {
                                  console.log("Opening Bincard for:", stock.stockId);
                                  console.log("Stock Info:", stock);
                                  setSelectedStock(stock); 
                                  setStkRefId(stock.stockId); // ✅ set only the stock ID
                                  setActiveTab('bincard');
                                  fetchStocks();
                                }}
                            >
                              Bincard
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                console.log("Opening Add Stock for:", stock.stockId);
                                console.log("Stock Info:", stock);

                                setSelectedStock(stock);           // Optional: for global selection
                                setStkRefId(stock.stockId);        // Optional: for Bincard logic
                                setSelectedStockToAdd(stock);      // ✅ store for AddStockForm
                                setOpenAddStockForm(true);         // ✅ open modal
                              }}
                            >
                              Add Stock
                            </button>
                          </li>
                          <li>
                            <a onClick={() => console.log("View/Edit clicked:", stock)}>View/Edit</a>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                setSelectedForDelete(stock);
                                setOpenDeleteStock(true);
                              }}
                            >
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                     ) : (
                      // 👤 Only Bincard for other users
                      <button
                        className="btn btn-sm btn-neutral"
                        onClick={() => {
                          setSelectedStock(stock);
                          setStkRefId(stock.stockId);
                          setActiveTab('bincard');
                        }}
                      >
                        Bincard
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* Stock Form Modal */}
      <Modal isOpen={openStockForm} onClose={() => setOpenStockForm(false)}>
        <StockRegisterForm
          onClose={() => setOpenStockForm(false)}
          onStockAdded={fetchStocks}
          />
      </Modal>

      {/* Add Stock Form Modal */}
      <Modal isOpen={openAddStockForm} onClose={() => setOpenAddStockForm(false)}>
        <AddStockForm
          stock={selectedStockToAdd} // ✅ pass stock as prop
          onClose={() => setOpenAddStockForm(false)}
          onStockAdded={fetchStocks}
        />
      </Modal>

      <Modal isOpen={openDeleteStock} onClose={() => setOpenDeleteStock(false)}>
        <StockDelete
          stock={selectedForDelete}
          onClose={() => setOpenDeleteStock(false)}
          onDeleted={fetchStocks}
        />
      </Modal>

    </div>
    </>
  );
};

