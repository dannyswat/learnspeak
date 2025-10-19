import React, { useState } from 'react';
import type { InvitationResponse } from '../types/journey';

interface InvitationListPanelProps {
  invitations: InvitationResponse[];
  onDeactivate: (invitationId: number) => Promise<void>;
  onRefresh: () => void;
}

const InvitationListPanel: React.FC<InvitationListPanelProps> = ({ 
  invitations, 
  onDeactivate, 
  onRefresh 
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleCopy = (invitation: InvitationResponse) => {
    // Construct full URL with current origin
    const fullUrl = `${window.location.origin}${invitation.invitationUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(invitation.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeactivate = async (invitation: InvitationResponse) => {
    if (!window.confirm('Are you sure you want to deactivate this invitation link?')) {
      return;
    }

    setLoadingId(invitation.id);
    try {
      await onDeactivate(invitation.id);
      onRefresh();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string; message?: string } } };
      alert(error.response?.data?.error || error.response?.data?.message || 'Failed to deactivate invitation');
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (invitation: InvitationResponse) => {
    if (!invitation.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">Inactive</span>;
    }
    if (!invitation.isValid) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-200 text-red-700">Expired</span>;
    }
    if (invitation.maxUses && invitation.currentUses >= invitation.maxUses) {
      return <span className="px-2 py-1 text-xs rounded-full bg-orange-200 text-orange-700">Max Uses Reached</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-200 text-green-700">Active</span>;
  };

  const getUsageText = (invitation: InvitationResponse) => {
    if (invitation.maxUses) {
      return `${invitation.currentUses} / ${invitation.maxUses}`;
    }
    return `${invitation.currentUses} (unlimited)`;
  };

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No invitation links have been created yet.</p>
        <p className="text-sm mt-2">Click "Generate Invitation Link" to create one.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Link
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uses
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expires
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invitations.map((invitation) => (
            <tr key={invitation.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(invitation)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <code className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded truncate max-w-xs">
                    {invitation.invitationToken}
                  </code>
                  <button
                    onClick={() => handleCopy(invitation)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    title="Copy full URL"
                  >
                    {copiedId === invitation.id ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {getUsageText(invitation)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {invitation.expiresAt
                  ? new Date(invitation.expiresAt).toLocaleDateString()
                  : 'Never'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(invitation.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {invitation.isActive ? (
                  <button
                    onClick={() => handleDeactivate(invitation)}
                    disabled={loadingId === invitation.id}
                    className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400"
                  >
                    {loadingId === invitation.id ? 'Deactivating...' : 'Deactivate'}
                  </button>
                ) : (
                  <span className="text-gray-400">Inactive</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvitationListPanel;
