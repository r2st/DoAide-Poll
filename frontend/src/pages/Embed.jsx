import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaCheck, FaCopy } from 'react-icons/fa'
import { getPoll } from '../api'

export default function Embed() {
  const { id } = useParams()
  const [poll, setPoll] = useState(null)
  const [size, setSize] = useState('full')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getPoll(id).then(setPoll).catch(() => {})
  }, [id])

  const baseUrl = 'https://poll.doaide.com'
  const embedCode = size === 'compact'
    ? `<iframe src="${baseUrl}/poll/${id}" width="400" height="500" frameborder="0" style="border:1px solid #e5e7eb;border-radius:12px;"></iframe>`
    : `<iframe src="${baseUrl}/poll/${id}" width="100%" height="600" frameborder="0" style="border:1px solid #e5e7eb;border-radius:12px;max-width:640px;"></iframe>`

  const copy = async () => {
    await navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Embed Poll</h1>
      <p className="text-gray-500 mb-8">
        Add this poll to your website, blog, or app.
      </p>

      {poll && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="font-bold text-gray-900">{poll.title}</h3>
          <p className="text-gray-500 text-sm mt-1">{poll.options.length} options &middot; {poll.total_votes} votes</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => setSize('full')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              size === 'full' ? 'bg-gold text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Full Size
          </button>
          <button
            onClick={() => setSize('compact')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              size === 'compact' ? 'bg-gold text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Compact
          </button>
        </div>

        <div className="relative">
          <pre className="bg-gray-900 text-gray-300 p-4 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap break-all">
            {embedCode}
          </pre>
          <button
            onClick={copy}
            className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
          >
            {copied ? <FaCheck /> : <FaCopy />}
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Preview</h3>
          <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: embedCode }} />
        </div>
      </div>

      <div className="mt-8 flex gap-3 justify-center">
        <Link
          to={`/poll/${id}`}
          className="bg-gold hover:bg-gold-dark text-gray-900 font-semibold px-5 py-2.5 rounded-lg transition-colors no-underline text-sm"
        >
          View Poll
        </Link>
        <Link
          to={`/poll/${id}/results`}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2.5 rounded-lg transition-colors no-underline text-sm"
        >
          View Results
        </Link>
      </div>
    </div>
  )
}
