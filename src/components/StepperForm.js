'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const steps = ['Basic Info', 'Stock-In', 'Review'];

export default function StepperForm({ onSubmit }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    stockCode: '',
    itemName: '',
    quantity: '',
    supplier: '',
    deliveryNote: '',
    note: '',
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="flex max-w-5xl mx-auto border rounded-xl bg-white shadow-md overflow-hidden">
      {/* Form content (left) */}
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          <motion.form
            key={step}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {step === 0 && (
              <>
                <div>
                  <label className="block text-sm mb-1">Stock Code</label>
                  <input
                    name="stockCode"
                    value={formData.stockCode}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Item Name</label>
                  <input
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Supplier</label>
                  <input
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Delivery Note #</label>
                  <input
                    name="deliveryNote"
                    value={formData.deliveryNote}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="space-y-2 text-sm">
                <p><strong>Stock Code:</strong> {formData.stockCode}</p>
                <p><strong>Item Name:</strong> {formData.itemName}</p>
                <p><strong>Quantity:</strong> {formData.quantity}</p>
                <p><strong>Supplier:</strong> {formData.supplier}</p>
                <p><strong>Delivery Note:</strong> {formData.deliveryNote}</p>
                <div>
                  <label className="block text-sm mt-3 mb-1">Final Remarks</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-between pt-4">
              {step > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 text-sm border rounded-md"
                >
                  Back
                </button>
              )}
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-4 py-2 bg-blue-600 text-white text-sm rounded-md"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 bg-green-600 text-white text-sm rounded-md"
                >
                  Submit
                </button>
              )}
            </div>
          </motion.form>
        </AnimatePresence>
      </div>

      {/* Stepper (right) */}
      <div className="w-48 bg-gray-50 border-l p-4 flex flex-col gap-6">
        {steps.map((label, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium 
              ${index === step ? 'bg-blue-600 text-white' :
                index < step ? 'bg-green-500 text-white' :
                'border border-gray-400 text-gray-400'}`}>
              {index < step ? <CheckCircle className="w-4 h-4" /> : index + 1}
            </div>
            <span className={`text-sm ${index === step ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
