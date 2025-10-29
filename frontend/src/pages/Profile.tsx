import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { uploadService } from '../services/wordService';
import Layout from '../components/Layout';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser, updateUserProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setProfilePicUrl(currentUser.profilePicUrl || '');
    }
  }, [currentUser]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const response = await uploadService.uploadProfilePhoto(file);
      setProfilePicUrl(response.url);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setError('');
    setSuccess(false);

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await userService.updateUser(currentUser.id, {
        name: name.trim(),
        email: email.trim() || undefined,
        profilePicUrl: profilePicUrl || undefined,
      });

      // Update auth context with new user data
      updateUserProfile(updatedUser);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Profile Settings</h2>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Profile updated successfully!
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit}>
            {/* Profile Picture */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profile Picture
              </label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profilePicUrl ? (
                    <img
                      src={uploadService.getFileUrl(profilePicUrl)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-gray-400">
                      {name.charAt(0).toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="profilePic"
                    className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 inline-block ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploading ? 'Uploading...' : 'Upload New Photo'}
                  </label>
                  <input
                    type="file"
                    id="profilePic"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG or GIF (max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Username (Read-only) */}
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={currentUser.username}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            </div>

            {/* Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
                required
              />
            </div>

            {/* Email */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>

            {/* Roles (Read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roles
              </label>
              <div className="flex gap-2">
                {currentUser.roles.map((role: string) => (
                  <span
                    key={role}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium capitalize"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
          <button
            onClick={() => navigate('/profile/change-password')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Change Password
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
