import { createRoot } from 'react-dom/client';

function MyApp() {
  return <h1>Hello, React!</h1>
}

const container = document.getElementById('react-root');
const root = createRoot(container);

root.render(<MyApp />);
