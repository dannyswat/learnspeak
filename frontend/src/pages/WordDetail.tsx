import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadService } from '../services/wordService';
import { useWord, useDeleteWord } from '../hooks/useWord';

const WordDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const wordId = id ? parseInt(id) : 0;

  const { data: word, isLoading: wordLoading, error } = useWord(wordId);
  const { mutate: deleteWord } = useDeleteWord();

  const handleDelete = async () => {
    if (!word || !window.confirm('Are you sure you want to delete this word?')) {
      return;
    }

    deleteWord(word.id, {
      onSuccess: () => {
        navigate('/words');
      },
      onError: () => {
        alert('Failed to delete word');
      },
    });
  };

  if (wordLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading word...</div>
      </div>
    );
  }

  const errorMessage = error instanceof Error ? error.message : '';
  if (errorMessage || !word) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{errorMessage || 'Word not found'}</p>
          <button
            onClick={() => navigate('/words')}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Back to Words
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {word.baseWord}
            </h2>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <button
              onClick={() => navigate('/words')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => navigate(`/words/${word.id}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Word Details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Word Information
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              {/* Image */}
              {word.imageUrl && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Image</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <img
                      src={uploadService.getFileUrl(word.imageUrl)}
                      alt={word.baseWord}
                      className="max-w-xs rounded-lg shadow"
                    />
                  </dd>
                </div>
              )}

              {/* Notes */}
              {word.notes && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                    {word.notes}
                  </dd>
                </div>
              )}

              {/* Creator */}
              {word.creator && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {word.creator.name} ({word.creator.email})
                  </dd>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(word.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(word.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Translations */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Translations ({word.translations.length})
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {word.translations.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-gray-500">
                No translations available
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {word.translations.map((trans) => (
                  <li key={trans.id} className="px-4 py-5 sm:px-6">
                    <div className="space-y-3">
                      {/* Language */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                            {trans.language?.name || 'Unknown'} ({trans.language?.code.toUpperCase()})
                          </span>
                        </div>
                      </div>

                      {/* Translation */}
                      <div>
                        <p className="text-2xl font-semibold text-gray-900">
                          {trans.translation}
                        </p>
                      </div>

                      {/* Romanization */}
                      {trans.romanization && (
                        <div>
                          <p className="text-sm text-gray-500">Romanization:</p>
                          <p className="text-lg text-gray-700">{trans.romanization}</p>
                        </div>
                      )}

                      {/* Audio */}
                      {trans.audioUrl && (
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Pronunciation:</p>
                          <audio
                            src={uploadService.getFileUrl(trans.audioUrl)}
                            controls
                            className="w-full max-w-md"
                          />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordDetail;
