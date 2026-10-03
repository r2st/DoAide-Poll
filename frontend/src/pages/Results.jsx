import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getResults, getExportUrl } from '../api'
import ShareButtons from '../components/ShareButtons'

const COLORS = ['#F0B429', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1']

export default function Results() {
  const { id } = useParams()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('bar')

  useEffect(() => {
    getResults(id)
      .then(setResults)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!results) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Results not found</h2>
      </div>
    )
  }

  const chartData = results.options
    .filter((o) => o.type === 'choice')
    .map((o) => ({ name: o.text, votes: o.votes, percentage: o.percentage }))

  const maxVotes = Math.max(...chartData.map((d) => d.votes), 1)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5">
          <h1 className="text-xl md:text-2xl font-bold text-white">{results.title}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {results.total_votes} total vote{results.total_votes !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setView('bar')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'bar' ? 'bg-gold text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setView('pie')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'pie' ? 'bg-gold text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pie Chart
            </button>
          </div>

          {view === 'bar' ? (
            <>
              <div className="space-y-4 mb-8">
                {chartData.map((d, i) => (
                  <div key={d.name}>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-medium text-gray-800">{d.name}</span>
                      <span className="text-sm text-gray-500">{d.votes} ({d.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div
                        className="h-full rounded-full animate-bar"
                        style={{
                          width: `${maxVotes > 0 ? (d.votes / maxVotes) * 100 : 0}%`,
                          backgroundColor: COLORS[i % COLORS.length],
                          minWidth: d.votes > 0 ? '2rem' : '0',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {chartData.length > 0 && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value, name, props) => [`${value} votes (${props.payload.percentage}%)`, 'Votes']}
                      />
                      <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <div className="h-80 flex items-center justify-center">
              {chartData.some((d) => d.votes > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.filter((d) => d.votes > 0)}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="votes"
                      nameKey="name"
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} votes`, 'Votes']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400">No votes yet</p>
              )}
            </div>
          )}

          {results.other_votes.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-2">Write-in responses</h3>
              <div className="space-y-1">
                {results.other_votes.map((o, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{o.text}</span>
                    <span className="text-gray-400">{o.votes}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.text_responses.length > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-2">Text responses</h3>
              <div className="space-y-2">
                {results.text_responses.map((t, i) => (
                  <p key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{t}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to={`/poll/${id}`}
            className="bg-gold hover:bg-gold-dark text-gray-900 font-semibold px-5 py-2.5 rounded-lg transition-colors no-underline text-sm"
          >
            Vote on this poll
          </Link>
          <a
            href={getExportUrl(id)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2.5 rounded-lg transition-colors no-underline text-sm"
          >
            Export CSV
          </a>
          <Link
            to={`/poll/${id}/embed`}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2.5 rounded-lg transition-colors no-underline text-sm"
          >
            Embed
          </Link>
        </div>

        <ShareButtons url={`/poll/${id}`} title={results.title} />
      </div>

      <div className="mt-8 text-center">
        <Link to="/create" className="text-gold hover:text-gold-dark font-semibold text-sm no-underline">
          Create your own poll at poll.doaide.com &rarr;
        </Link>
      </div>
    </div>
  )
}
