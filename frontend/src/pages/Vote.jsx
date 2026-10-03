import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getPoll, submitVote } from '../api'
import ShareButtons from '../components/ShareButtons'

export default function Vote() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const justCreated = searchParams.get('created') === 'true'

  const [poll, setPoll] = useState(null)
  const [selected, setSelected] = useState([])
  const [otherText, setOtherText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getPoll(id)
      .then(setPoll)
      .catch(() => setError('Poll not found'))
      .finally(() => setLoading(false))
  }, [id])

  const toggleOption = (optionId) => {
    if (poll.choice_type === 'single') {
      setSelected([optionId])
    } else {
      setSelected((prev) =>
        prev.includes(optionId) ? prev.filter((x) => x !== optionId) : [...prev, optionId]
      )
    }
  }

  const handleVote = async () => {
    if (selected.length === 0 && !otherText.trim()) {
      setError('Please select an option')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const votes = selected.map((option_id) => ({ option_id }))
      if (otherText.trim()) {
        votes.push({ text_value: otherText.trim() })
      }
      await submitVote(id, votes)
      navigate(`/poll/${id}/results`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Poll not found</h2>
        <p className="text-gray-500">This poll may have been removed or the link is incorrect.</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {justCreated && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8">
          <h3 className="font-bold text-green-800 mb-2">Poll created!</h3>
          <p className="text-green-700 text-sm mb-4">Share this link to start collecting votes:</p>
          <ShareButtons url={`/poll/${id}`} title={poll.title} />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5">
          <h1 className="text-xl md:text-2xl font-bold text-white">{poll.title}</h1>
          {poll.description && <p className="text-gray-300 text-sm mt-1">{poll.description}</p>}
          <p className="text-gray-400 text-xs mt-2">{poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''} so far</p>
        </div>

        <div className="p-6 space-y-3">
          {poll.options
            .filter((o) => o.type === 'choice')
            .map((option) => (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={`w-full text-left px-5 py-3.5 rounded-xl border-2 transition-all ${
                  selected.includes(option.id)
                    ? 'border-gold bg-brand-50 text-gray-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selected.includes(option.id) ? 'border-gold bg-gold' : 'border-gray-300'
                    }`}
                  >
                    {selected.includes(option.id) && (
                      <span className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </span>
                  {option.text}
                </span>
              </button>
            ))}

          {poll.allow_other && (
            <div className="mt-4">
              <input
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Other (write in)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold outline-none"
              />
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}

          <button
            onClick={handleVote}
            disabled={submitting}
            className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-gray-900 font-bold py-3.5 rounded-xl text-lg transition-colors mt-4"
          >
            {submitting ? 'Submitting...' : 'Vote'}
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(`/poll/${id}/results`)}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          View results without voting
        </button>
      </div>
    </div>
  )
}
