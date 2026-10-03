import { useState } from 'react'
import { FaWhatsapp, FaTwitter, FaLinkedin, FaLink, FaCheck } from 'react-icons/fa'

export default function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false)
  const fullUrl = `https://poll.doaide.com${url}`
  const text = encodeURIComponent(`${title} — Vote now!`)
  const encodedUrl = encodeURIComponent(fullUrl)

  const copy = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <a
        href={`https://wa.me/?text=${text}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors no-underline"
      >
        <FaWhatsapp className="text-lg" /> WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors no-underline"
      >
        <FaTwitter className="text-lg" /> Twitter
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors no-underline"
      >
        <FaLinkedin className="text-lg" /> LinkedIn
      </a>
      <button
        onClick={copy}
        className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
      >
        {copied ? <FaCheck className="text-lg" /> : <FaLink className="text-lg" />}
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  )
}
