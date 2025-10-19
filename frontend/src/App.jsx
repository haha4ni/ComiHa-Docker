import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainMode from "./shell/MainMode";
import HomePage from "./shell/pages/HomePage";
import Dashboard from "./shell/pages/Dashboard";

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainMode />}>
                    <Route index element={<HomePage />} />
                    <Route path="dashboard" element={<Dashboard />} />
                </Route>
            </Routes>
        </Router>
    );
}
