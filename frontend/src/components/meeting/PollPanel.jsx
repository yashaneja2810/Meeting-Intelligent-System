import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PollPanel({ polls, currentUser, isHost, onCreatePoll, onVotePoll, onClosePoll }) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-white font-semibold">
          Polls ({polls.length})
        </h3>
        {isHost && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {showCreateForm ? 'Cancel' : '+ New Poll'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Create Poll Form */}
        <AnimatePresence>
          {showCreateForm && (
            <CreatePollForm
              onSubmit={(question, options, allowMultiple, anonymous) => {
                onCreatePoll(question, options, allowMultiple, anonymous);
                setShowCreateForm(false);
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          )}
        </AnimatePresence>

        {/* Polls List */}
        {polls.length === 0 && !showCreateForm ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-sm">No polls yet</p>
            {isHost && (
              <p className="text-xs mt-1">Create a poll to engage participants</p>
            )}
          </div>
        ) : (
          polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              currentUser={currentUser}
              isHost={isHost}
              onVote={onVotePoll}
              onClose={onClosePoll}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CreatePollForm({ onSubmit, onCancel }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [anonymous, setAnonymous] = useState(false);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim());
    if (question.trim() && validOptions.length >= 2) {
      onSubmit(question, validOptions, allowMultiple, anonymous);
    }
  };

  const isValid = question.trim() && options.filter(o => o.trim()).length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-gray-800 rounded-lg p-4"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Question */}
        <div>
          <label className="text-white text-sm font-medium block mb-1">
            Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question..."
            maxLength={500}
            className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Options */}
        <div>
          <label className="text-white text-sm font-medium block mb-1">
            Options
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  maxLength={200}
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-400 hover:text-red-300 px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="text-blue-400 hover:text-blue-300 text-sm mt-2"
            >
              + Add Option
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(e) => setAllowMultiple(e.target.checked)}
              className="rounded"
            />
            Allow multiple selections
          </label>
          <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="rounded"
            />
            Anonymous voting
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Create Poll
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function PollCard({ poll, currentUser, isHost, onVote, onClose }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.vote_count || 0), 0) || 0;

  const handleVote = () => {
    if (selectedOptions.length > 0) {
      onVote(poll.id, poll.allow_multiple ? selectedOptions : [selectedOptions[0]]);
      setHasVoted(true);
    }
  };

  const handleOptionToggle = (optionId) => {
    if (poll.allow_multiple) {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const canVote = poll.is_active && !hasVoted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-4"
    >
      {/* Question */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-white font-medium flex-1">{poll.question}</h4>
        {!poll.is_active && (
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
            Closed
          </span>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {poll.options?.map((option) => {
          const percentage = totalVotes > 0 ? (option.vote_count / totalVotes * 100) : 0;
          const isSelected = selectedOptions.includes(option.id);

          return (
            <div key={option.id} className="relative">
              {/* Progress Bar Background */}
              <div
                className="absolute inset-0 bg-blue-600 opacity-20 rounded"
                style={{ width: `${percentage}%` }}
              />

              {/* Option Content */}
              <div
                onClick={() => canVote && handleOptionToggle(option.id)}
                className={`relative flex items-center justify-between p-3 rounded cursor-pointer transition-colors ${
                  canVote
                    ? isSelected
                      ? 'bg-blue-600 bg-opacity-30 border-2 border-blue-500'
                      : 'hover:bg-gray-700 border-2 border-transparent'
                    : 'border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  {canVote && (
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-500'
                    }`}>
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                  )}
                  <span className="text-white text-sm">{option.text}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">
                    {Math.round(percentage)}%
                  </span>
                  <span className="text-gray-500 text-xs">
                    {option.vote_count} {option.vote_count === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
        <span>{totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}</span>
        {poll.allow_multiple && (
          <span>Multiple selections allowed</span>
        )}
        {poll.anonymous && (
          <span>🔒 Anonymous</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {canVote && (
          <button
            onClick={handleVote}
            disabled={selectedOptions.length === 0}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Vote
          </button>
        )}

        {hasVoted && poll.is_active && (
          <div className="flex-1 bg-green-600 text-white py-2 rounded text-center text-sm font-medium">
            ✓ Voted
          </div>
        )}

        {isHost && poll.is_active && (
          <button
            onClick={() => onClose(poll.id)}
            className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition-colors text-sm"
          >
            Close Poll
          </button>
        )}
      </div>
    </motion.div>
  );
}
