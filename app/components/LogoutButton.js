'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';

// Confirmation Modal Component
function LogoutConfirmationModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Are you sure you want to log out?</h2>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Yes, Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Logout Button
export default function LogoutButton() {
  const [isModalOpen, setIsModalOpen] = useState(false); // To manage modal visibility

  // Handle Logout Confirmation
  const handleLogoutConfirmation = () => {
    setIsModalOpen(true); // Show the confirmation modal
  };

  // Confirm logout action
  const handleLogout = () => {
    localStorage.removeItem('jwtToken'); // Remove JWT token from localStorage
    window.location.href = '/'; // Redirect to home or login page
    toast.success('Successfully logged out');
  };

  // Cancel logout action
  const handleCancel = () => {
    setIsModalOpen(false); // Close the modal if the user cancels
  };

  return (
    <div>
      <button
        onClick={handleLogoutConfirmation}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>

      {/* Render the confirmation modal */}
      <LogoutConfirmationModal
        isOpen={isModalOpen}
        onCancel={handleCancel}
        onConfirm={handleLogout}
      />
    </div>
  );
}
