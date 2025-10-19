import React, { useState } from 'react';
import type { CreateInvitationRequest, InvitationResponse } from '../types/journey';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: CreateInvitationRequest) => Promise<InvitationResponse>;
}

const InvitationModal: React.FC<InvitationModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [expiresInDays, setExpiresInDays] = useState<string>('');
  const [maxUses, setMaxUses] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generatedInvitation, setGeneratedInvitation] = useState<InvitationResponse | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const data: CreateInvitationRequest = {};
      
      if (expiresInDays) {
        const days = parseInt(expiresInDays);
        if (days < 1 || days > 365) {
          setError('Expiration must be between 1 and 365 days');
          setLoading(false);
          return;
        }
        data.expiresInDays = days;
      }

      if (maxUses) {
        const uses = parseInt(maxUses);
        if (uses < 1) {
          setError('Max uses must be at least 1');
          setLoading(false);
          return;
        }
        data.maxUses = uses;
      }

      const invitation = await onGenerate(data);
      setGeneratedInvitation(invitation);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      setError(error.response?.data?.error || error.response?.data?.message || 'Failed to generate invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedInvitation) {
      // Construct full URL with current origin
      const fullUrl = `${window.location.origin}${generatedInvitation.invitationUrl}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setExpiresInDays('');
    setMaxUses('');
    setGeneratedInvitation(null);
    setError('');
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Generate Invitation Link</h2>

          {!generatedInvitation ? (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires In (days)
                </label>
                <input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  placeholder="Leave empty for no expiration"
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Optional: Link will expire after this many days (1-365)
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Uses
                </label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="Leave empty for unlimited uses"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Optional: Maximum number of students who can use this link
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Link'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">
                  ✓ Invitation link generated successfully!
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={`${window.location.origin}${generatedInvitation.invitationUrl}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 text-sm font-medium"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="mb-4 space-y-2 text-sm text-gray-600">
                {generatedInvitation.expiresAt && (
                  <p>
                    <span className="font-medium">Expires:</span>{' '}
                    {new Date(generatedInvitation.expiresAt).toLocaleDateString()}
                  </p>
                )}
                {generatedInvitation.maxUses && (
                  <p>
                    <span className="font-medium">Max Uses:</span> {generatedInvitation.maxUses}
                  </p>
                )}
                <p>
                  <span className="font-medium">Current Uses:</span> {generatedInvitation.currentUses}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationModal;
