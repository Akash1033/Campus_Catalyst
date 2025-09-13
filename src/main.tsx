import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase, ensureEventApprovalColumn } from './lib/supabase.ts';

// Check if event approval column exists before rendering
const init = async () => {
  try {
    // Test Supabase connection
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error("Supabase auth error:", authError);
    } else {
      console.log("Supabase connection successful", session ? "User is logged in" : "No user session");
    }

    await ensureEventApprovalColumn();
  } catch (error) {
    console.error("Error during initialization:", error);
  }
  
  // Render app regardless of initialization result
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found!");
    return;
  }
  
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
  } catch (error) {
    console.error("Error rendering app:", error);
  }
};

init();
