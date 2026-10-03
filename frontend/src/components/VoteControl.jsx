import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from './ui.jsx';

/**
 * Upvote/downvote control for "is this tag accurate?".
 * Requires login. Re-voting the same direction retracts the vote.
 */
export default function VoteControl({ dish, onChange }) {
  const { isAuthenticated } = useAuth();
  const [myVote, setMyVote] = useState(dish.my_vote || null);
  const [votes, setVotes] = useState({
    up: dish.community_votes?.up ?? 0,
    down: dish.community_votes?.down ?? 0,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const total = votes.up + votes.down;
  // Net score, clamped, mirroring the backend's confidence with a prior of 5.
  const confidence = total === 0 ? null : (votes.up - votes.down) / (total + 5);
  const netScore = votes.up - votes.down;

  async function vote(direction) {
    if (!isAuthenticated || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await onChange(direction);
      if (res) {
        setMyVote(res.my_vote);
        setVotes(res.community_votes);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
        <a href="/login" className="font-medium text-brand-700 underline">
          Log in
        </a>{' '}
        to vote on whether these tags are accurate.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-700">Is this tag accuracy correct?</p>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => vote('up')}
          disabled={pending}
          aria-pressed={myVote === 'up'}
          className={`btn flex-1 py-1.5 text-xs ${
            myVote === 'up'
              ? 'bg-brand-600 text-white'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          {pending ? <Spinner className="h-3 w-3" /> : <span aria-hidden="true">▲</span>}
          Accurate
        </button>
        <button
          type="button"
          onClick={() => vote('down')}
          disabled={pending}
          aria-pressed={myVote === 'down'}
          className={`btn flex-1 py-1.5 text-xs ${
            myVote === 'down'
              ? 'bg-red-600 text-white'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span aria-hidden="true">▼</span>
          Not accurate
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        <span className="font-medium text-slate-700">{votes.up} up</span>
        {' / '}
        <span className="font-medium text-slate-700">{votes.down} down</span>
        {total > 0 && (
          <>
            {' · '}
            <span
              className={`font-medium ${netScore >= 0 ? 'text-brand-700' : 'text-red-600'}`}
              title="Confidence score: net votes damped by total vote count"
            >
              {netScore >= 0 ? '+' : ''}
              {netScore} net
              {confidence !== null && ` (${Math.round(confidence * 100)}% confidence)`}
            </span>
          </>
        )}
        {total === 0 && <span className="ml-1">· no votes yet</span>}
      </p>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
