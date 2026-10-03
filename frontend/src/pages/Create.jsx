import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaPlus, FaTrash, FaGripVertical } from 'react-icons/fa'
import { createPoll } from '../api'

const QUESTION_TYPES = [
  { value: 'choice', label: 'Multiple Choice' },
  { value: 'text', label: 'Text Input' },
  { value: 'rating', label: 'Rating (1-5 stars)' },
  { value: 'yesno', label: 'Yes / No' },
]

function SurveyQuestion({ question, index, onChange, onRemove, total }) {
  const update = (field, value) => {
    onChange(index, { ...question, [field]: value })
  }

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <div className="flex items-start gap-3">
        <FaGripVertical className="text-gray-400 mt-3 cursor-grab" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={question.text}
              onChange={(e) => update('text', e.target.value)}
              placeholder={`Question ${index + 1}`}
              className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none"
            />
            <select
              value={question.type}
              onChange={(e) => update('type', e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-gold focus:border-gold outline-none"
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {question.type === 'choice' && (
            <div className="space-y-2 ml-1">
              {question.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm w-5">{oi + 1}.</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const opts = [...question.options]
                      opts[oi] = e.target.value
                      update('options', opts)
                    }}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none text-sm"
                  />
                  {question.options.length > 2 && (
                    <button
                      onClick={() => {
                        const opts = question.options.filter((_, i) => i !== oi)
                        update('options', opts)
                      }}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  )}
                </div>
              ))}
              {question.options.length < 10 && (
                <button
                  onClick={() => update('options', [...question.options, ''])}
                  className="text-gold hover:text-gold-dark text-sm font-medium flex items-center gap-1 ml-6"
                >
                  <FaPlus className="text-xs" /> Add option
                </button>
              )}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => update('required', e.target.checked)}
              className="accent-gold"
            />
            Required
          </label>
        </div>
        {total > 1 && (
          <button onClick={() => onRemove(index)} className="text-gray-400 hover:text-red-500 p-1 mt-2">
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Create() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isSurvey = searchParams.get('type') === 'survey'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [choiceType, setChoiceType] = useState('single')
  const [allowOther, setAllowOther] = useState(false)
  const [dupPrevention, setDupPrevention] = useState('none')
  const [endDate, setEndDate] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [questions, setQuestions] = useState([
    { text: '', type: 'choice', options: ['', ''], required: false },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addOption = () => {
    if (options.length < 10) setOptions([...options, ''])
  }

  const removeOption = (i) => {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i))
  }

  const addQuestion = () => {
    setQuestions([...questions, { text: '', type: 'choice', options: ['', ''], required: false }])
  }

  const updateQuestion = (i, q) => {
    const qs = [...questions]
    qs[i] = q
    setQuestions(qs)
  }

  const removeQuestion = (i) => {
    setQuestions(questions.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a question or title')
      return
    }

    let pollOptions
    if (isSurvey) {
      const valid = questions.filter((q) => q.text.trim())
      if (valid.length === 0) {
        setError('Add at least one question')
        return
      }
      pollOptions = []
      for (const q of valid) {
        if (q.type === 'choice') {
          const validOpts = q.options.filter((o) => o.trim())
          if (validOpts.length < 2) {
            setError(`"${q.text}" needs at least 2 options`)
            return
          }
          for (const o of validOpts) {
            pollOptions.push({ text: o, option_type: 'choice', required: q.required, position: pollOptions.length })
          }
        } else if (q.type === 'yesno') {
          pollOptions.push({ text: 'Yes', option_type: 'choice', required: q.required, position: pollOptions.length })
          pollOptions.push({ text: 'No', option_type: 'choice', required: q.required, position: pollOptions.length })
        } else {
          pollOptions.push({ text: q.text, option_type: q.type, required: q.required, position: pollOptions.length })
        }
      }
    } else {
      const validOpts = options.filter((o) => o.trim())
      if (validOpts.length < 2) {
        setError('Add at least 2 options')
        return
      }
      pollOptions = validOpts.map((o, i) => ({ text: o, option_type: 'choice', required: false, position: i }))
    }

    setLoading(true)
    try {
      const data = await createPoll({
        title: title.trim(),
        description: description.trim(),
        poll_type: isSurvey ? 'survey' : 'poll',
        choice_type: choiceType,
        allow_other: allowOther,
        duplicate_prevention: dupPrevention,
        end_date: endDate || null,
        options: pollOptions,
      })
      navigate(`/poll/${data.id}?created=true`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {isSurvey ? 'Build a Survey' : 'Create a Poll'}
      </h1>
      <p className="text-gray-500 mb-8">
        {isSurvey ? 'Add multiple questions with different types.' : 'Enter your question and options to get started.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {isSurvey ? 'Survey Title' : 'Your Question'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isSurvey ? 'Employee Satisfaction Survey' : 'What should we have for lunch?'}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold outline-none text-lg"
          />
        </div>

        {isSurvey && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell respondents what this survey is about..."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold outline-none resize-none"
            />
          </div>
        )}

        {!isSurvey && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Answer Options</label>
              <div className="space-y-2.5">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm font-medium w-6 text-right">{i + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options]
                        newOpts[i] = e.target.value
                        setOptions(newOpts)
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none"
                    />
                    {options.length > 2 && (
                      <button type="button" onClick={() => removeOption(i)} className="text-gray-400 hover:text-red-500 p-2">
                        <FaTrash className="text-sm" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 text-gold hover:text-gold-dark font-medium text-sm flex items-center gap-1.5 ml-8"
                >
                  <FaPlus className="text-xs" /> Add option
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="choiceType"
                  value="single"
                  checked={choiceType === 'single'}
                  onChange={(e) => setChoiceType(e.target.value)}
                  className="accent-gold"
                />
                Single choice
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="choiceType"
                  value="multiple"
                  checked={choiceType === 'multiple'}
                  onChange={(e) => setChoiceType(e.target.value)}
                  className="accent-gold"
                />
                Multiple choice
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={allowOther}
                  onChange={(e) => setAllowOther(e.target.checked)}
                  className="accent-gold"
                />
                Allow "Other" write-in
              </label>
            </div>
          </>
        )}

        {isSurvey && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Questions</label>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <SurveyQuestion
                  key={i}
                  question={q}
                  index={i}
                  onChange={updateQuestion}
                  onRemove={removeQuestion}
                  total={questions.length}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="mt-4 text-gold hover:text-gold-dark font-medium text-sm flex items-center gap-1.5"
            >
              <FaPlus className="text-xs" /> Add question
            </button>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-5 space-y-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 text-sm">Settings</h3>
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duplicate prevention</label>
              <select
                value={dupPrevention}
                onChange={(e) => setDupPrevention(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-gold focus:border-gold outline-none"
              >
                <option value="none">None (allow multiple votes)</option>
                <option value="ip">IP-based (one vote per device)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End date (optional)</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gold focus:border-gold outline-none"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold hover:bg-gold-dark disabled:opacity-50 text-gray-900 font-bold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-gold/20"
        >
          {loading ? 'Creating...' : isSurvey ? 'Create Survey' : 'Create Poll'}
        </button>
      </form>
    </div>
  )
}
