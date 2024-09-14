import React from "react";
import { Link } from "react-router-dom";

export default function NavigationBar() {
  return (
    <div id="navigationBar">
      <h1>
        <Link to="/">reCall </Link>
      </h1>
      <div class="options">
        <a className="recall">
          <Link to="/recall"> Recall</Link>
        </a>
        <a className="memories">
          <Link to="/memories"> memories</Link>
        </a>
        <a className="livepage">
          <Link to="/LivePage">Live</Link>
        </a>
      </div>
    </div>
  );
}
