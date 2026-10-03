import { Link } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1 text-xl font-bold text-gray-900 no-underline">
            DoAide <span className="italic text-gold font-semibold">Poll</span>
          </Link>
          <Link
            to="/create"
            className="bg-gold hover:bg-gold-dark text-white font-semibold px-5 py-2 rounded-lg transition-colors no-underline text-sm"
          >
            Create Poll
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm">
            <Link to="/" className="text-gold hover:text-gold-dark no-underline font-semibold">
              DoAide <span className="italic">Poll</span>
            </Link>
            {' '}&mdash; Free polls & surveys for everyone.
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Create your own poll at{' '}
            <a href="https://poll.doaide.com" className="text-gold hover:underline">poll.doaide.com</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
