import "./App.css";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import NavigationBar from "./components/ui/NavigationBar";
import LivePage from "./components/ui/LivePage";

function App() {
  return (
    <div className="App">
      <Router>
        <NavigationBar />
        <header className="App-header">
          <Routes>
            <Route exact path="LivePage" element={<LivePage />} />
          </Routes>
        </header>
      </Router>
    </div>
  );
}

export default App;
