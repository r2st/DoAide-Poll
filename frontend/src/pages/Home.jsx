import { Link } from 'react-router-dom'
import { FaBolt, FaClipboardList, FaChartBar, FaCode, FaShareAlt, FaGlobe } from 'react-icons/fa'

const features = [
  { icon: FaBolt, title: 'Quick Polls', desc: 'Create a poll in under 15 seconds. Question, options, share.' },
  { icon: FaClipboardList, title: 'Multi-Question Surveys', desc: 'Multiple choice, text, ratings, yes/no — build full surveys.' },
  { icon: FaChartBar, title: 'Live Results', desc: 'Animated charts show results in real time. Export as CSV.' },
  { icon: FaShareAlt, title: 'Easy Sharing', desc: 'Share via WhatsApp, Twitter, LinkedIn, or copy the link.' },
  { icon: FaCode, title: 'Embed Anywhere', desc: 'Drop a poll into any website with a simple embed code.' },
  { icon: FaGlobe, title: '100% Free', desc: 'No login, no limits, no catch. Create unlimited polls.' },
]

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Create Free Polls &<br />
            <span className="italic text-gold">Surveys</span> in Seconds
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            No login required. Create a poll, share the link, get instant results.
            Perfect for teams, classrooms, events, and social media.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create"
              className="bg-gold hover:bg-gold-dark text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition-colors no-underline shadow-lg shadow-gold/20"
            >
              Create a Poll &rarr;
            </Link>
            <Link
              to="/create?type=survey"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors no-underline border border-white/20"
            >
              Build a Survey
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need, <span className="italic text-gold">nothing</span> you don't
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <f.icon className="text-gold text-3xl mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gold/10 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-8">
            It takes 15 seconds to create a poll and share it with the world.
          </p>
          <Link
            to="/create"
            className="inline-block bg-gold hover:bg-gold-dark text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition-colors no-underline"
          >
            Create Your Poll Now
          </Link>
        </div>
      </section>
    </>
  )
}
