import React from 'react'
import ReactDOM from 'react-dom/client'
import { loadProducts } from './data/products'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <div className="grid min-h-dvh place-items-center bg-ivory text-espresso" role="status">
    <p className="animate-pulse text-sm font-semibold tracking-[.2em]">BEASTSPORTS</p>
  </div>,
)

// The storefront reads the catalog synchronously, so load it from Supabase before importing the app.
loadProducts()
  .then(() => import('./App'))
  .then(({ default: App }) =>
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    ),
  )
  .catch((error) => {
    console.error(error)
    root.render(
      <div className="grid min-h-dvh place-items-center bg-ivory px-6 text-center text-espresso">
        <div>
          <p className="text-sm font-semibold tracking-[.2em]">BEASTSPORTS</p>
          <h1 className="mt-4 text-2xl">We couldn’t load the shop.</h1>
          <p className="mt-2 text-sm text-clay">Check your internet connection and try again.</p>
          <button
            type="button"
            onClick={() => location.reload()}
            className="mt-6 cursor-pointer rounded-full bg-espresso px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ivory"
          >
            Try again
          </button>
        </div>
      </div>,
    )
  })
