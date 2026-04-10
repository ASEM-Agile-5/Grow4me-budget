import './App.css'

const modules = [
  { icon: '🌱', title: 'Season Budget', description: 'Create and manage budgets per farming season.' },
  { icon: '💸', title: 'Expense Tracking', description: 'Track seeds, labor, fertilizer, and more.' },
  { icon: '📦', title: 'Revenue Tracking', description: 'Record harvest sales and income sources.' },
  { icon: '📊', title: 'Reports & Analytics', description: 'View profit/loss and financial summaries.' },
]

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">🌾 Grow4me</div>
        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Budget</a>
          <a href="#">Reports</a>
          <button className="btn-primary">Sign In</button>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Farm Budgeting,<br />Simplified.</h1>
          <p>Plan seasons, track expenses, and monitor your farm's profitability — all in one place.</p>
          <button className="btn-primary btn-large">Get Started</button>
        </section>

        <section className="modules">
          <h2>Core Modules</h2>
          <div className="grid">
            {modules.map((m) => (
              <div className="card" key={m.title}>
                <span className="card-icon">{m.icon}</span>
                <h3>{m.title}</h3>
                <p>{m.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>Grow4me Budget &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
