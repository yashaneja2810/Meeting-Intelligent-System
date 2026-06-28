import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Icons
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function PollPanel({ polls, currentUser, isHost, onCreatePoll, onVotePoll, onClosePoll }) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="h-full flex flex-col" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-sm">Polls</h3>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full font-medium">
            {polls.length}
          </span>
        </div>
        {isHost && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5"
          >
            {showCreateForm ? (
              <>
                <XIcon />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <PlusIcon />
                <span>New Poll</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <p className="text-white/30 text-sm">No polls yet</p>
            {isHost && (
              <p className="text-white/15 text-xs mt-1">Create a poll to engage participants</p>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                currentUser={currentUser}
                isHost={isHost}
                onVote={onVotePoll}
                onClose={onClosePoll}
              />
            ))}
          </AnimatePresence>
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
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <div className="rounded-xl p-4" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Question */}
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1.5 uppercase tracking-wider">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              maxLength={500}
              className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}
              required
            />
          </div>

          {/* Options */}
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1.5 uppercase tracking-wider">
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
                    className="flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="text-red-400/60 hover:text-red-400 px-2 transition-colors"
                    >
                      <XIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-1.5 text-white/40 hover:text-white/60 text-xs mt-2 transition-colors"
              >
                <PlusIcon />
                <span>Add option</span>
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 text-white/60 text-xs cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                allowMultiple ? 'bg-[#111111] border-white' : 'border-white/20 group-hover:border-white/40'
              }`}>
                {allowMultiple && <span className="text-black"><CheckIcon /></span>}
              </div>
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="sr-only"
              />
              Allow multiple selections
            </label>
            <label className="flex items-center gap-2 text-white/60 text-xs cursor-pointer group">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                anonymous ? 'bg-[#111111] border-white' : 'border-white/20 group-hover:border-white/40'
              }`}>
                {anonymous && <span className="text-black"><CheckIcon /></span>}
              </div>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="sr-only"
              />
              Anonymous voting
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!isValid}
              className="flex-1 bg-[#111111] text-black py-2.5 rounded-lg font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Create Poll
            </motion.button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-white/50 hover:text-white/70 text-sm rounded-lg hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl p-4"
      style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Question */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-white font-medium text-sm flex-1 leading-snug">{poll.question}</h4>
        {!poll.is_active && (
          <span className="text-[10px] text-white/30 border border-white/10 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
            Closed
          </span>
        )}
      </div>

      {/* Options */}
      <div className="space-y-1.5 mb-3">
        {poll.options?.map((option) => {
          const percentage = totalVotes > 0 ? (option.vote_count / totalVotes * 100) : 0;
          const isSelected = selectedOptions.includes(option.id);

          return (
            <div
              key={option.id}
              onClick={() => canVote && handleOptionToggle(option.id)}
              className={`relative rounded-lg overflow-hidden transition-all duration-200 ${
                canVote ? 'cursor-pointer hover:bg-white/[0.03]' : ''
              } ${isSelected ? 'ring-1 ring-white/30' : ''}`}
              style={{ background: '#1a1a1a' }}
            >
              {/* Animated Progress Bar */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ background: 'rgba(255,255,255,0.05)' }}
              />

              {/* Option Content */}
              <div className="relative flex items-center justify-between p-3">
                <div className="flex items-center gap-2.5">
                  {canVote && (
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all flex-shrink-0 ${
                      isSelected ? 'border-white bg-[#111111]' : 'border-white/20'
                    }`}>
                      {isSelected && <span className="text-black"><CheckIcon /></span>}
                    </div>
                  )}
                  <span className="text-white/80 text-sm">{option.text}</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-white/40 text-xs font-medium">
                    {Math.round(percentage)}%
                  </span>
                  <span className="text-white/20 text-[10px]">
                    {option.vote_count || 0}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-[10px] text-white/25 mb-3">
        <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
        <div className="flex items-center gap-2">
          {poll.allow_multiple && <span>Multiple allowed</span>}
          {poll.anonymous && <span>🔒 Anonymous</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {canVote && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVote}
            disabled={selectedOptions.length === 0}
            className="flex-1 bg-[#111111] text-black py-2 rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Vote
          </motion.button>
        )}

        {hasVoted && poll.is_active && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-400 py-2 rounded-lg text-sm font-medium"
          >
            <CheckIcon />
            <span>Voted</span>
          </motion.div>
        )}

        {isHost && poll.is_active && (
          <button
            onClick={() => onClose(poll.id)}
            className="px-4 py-2 text-white/40 hover:text-white/60 text-sm rounded-lg hover:bg-white/5 transition-all border border-white/5"
          >
            Close
          </button>
        )}
      </div>
    </motion.div>
  );
}
