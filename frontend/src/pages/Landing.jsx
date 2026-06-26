import { Link } from 'react-router-dom';
import { QrCode, Zap, BarChart3, Smartphone, ArrowRight, UtensilsCrossed } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-surface-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-surface-900">DineFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          Smart QR Restaurant Ordering Platform
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-surface-900 tracking-tight mb-6 leading-tight">
          Digital ordering<br />
          <span className="text-brand-600">for modern restaurants</span>
        </h1>
        <p className="text-xl text-surface-500 max-w-2xl mx-auto mb-10">
          Let customers scan, browse, and order from their table. Manage your menu, track orders in real-time, and grow your business — all from one dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-base px-6 py-3">
            Start free trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="btn-secondary text-base px-6 py-3">Sign in</Link>
        </div>
      </section>

      <section className="bg-surface-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-surface-900 mb-4">Everything you need to go digital</h2>
          <p className="text-surface-500 text-center mb-16 max-w-xl mx-auto">
            From QR code generation to live order tracking — built for restaurants that want to move fast.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: QrCode, title: 'QR Table Ordering', desc: 'Generate QR codes for each table. Customers scan and order instantly — no app download needed.' },
              { icon: Smartphone, title: 'Real-time Orders', desc: 'Receive orders instantly on your dashboard. Update status and customers see live progress.' },
              { icon: BarChart3, title: 'Menu & Analytics', desc: 'Manage your full menu with images, categories, and offers. Track revenue and popular items.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-8">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">{title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-surface-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-surface-400">
          © 2024 DineFlow. Smart QR Restaurant Ordering Platform.
        </div>
      </footer>
    </div>
  );
}
