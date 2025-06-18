'use client'

import { useEffect, useState } from 'react'

export default function DirectoryPage() {
  const [staffList, setStaffList] = useState([])
  const [formData, setFormData] = useState({ name: '', email: '', position: '' })
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchStaff = async () => {
    const res = await fetch('/api/staff')
    const data = await res.json()
    setStaffList(data)
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    setFormData({ name: '', email: '', position: '' })
    setIsModalOpen(false)
    fetchStaff()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Staff Directory</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Staff
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Register Staff</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full border px-3 py-2 rounded"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border px-3 py-2 rounded"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Position"
                className="w-full border px-3 py-2 rounded"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Position</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((staff) => (
            <tr key={staff._id}>
              <td className="border px-4 py-2">{staff.name}</td>
              <td className="border px-4 py-2">{staff.email}</td>
              <td className="border px-4 py-2">{staff.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
