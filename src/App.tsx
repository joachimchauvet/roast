import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { RoastForm } from "./components/RoastForm";
import { RoastDisplay } from "./components/RoastDisplay";
import { Leaderboard } from "./components/Leaderboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoastForm />} />
        <Route path="/roast/:id" element={<RoastDisplay />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;