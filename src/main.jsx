import { Component } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/theme.css";

// Shows the real error on screen instead of a black page.
class Boundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) return <pre style={{ color: "#ffd24a", padding: 24, whiteSpace: "pre-wrap" }}>{String(this.state.err.stack || this.state.err)}</pre>;
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(<Boundary><App /></Boundary>);