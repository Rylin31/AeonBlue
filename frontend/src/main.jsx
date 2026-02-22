import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// NOTE: StrictMode removed — it causes Leaflet to double-initialize in dev
// (runs useEffect cleanup+remount cycle which breaks Leaflet's DOM node tracking)
createRoot(document.getElementById('root')).render(<App />)
