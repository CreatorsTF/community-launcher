import React from "react";
import ReactDOM from "react-dom";
import Testing from "./components/testing";
import TitleBar from "./components/titlebar";
import "./styles/style.scss";

const mainElement = document.createElement("div");
document.body.appendChild(mainElement);

const App = () => {
    return (
        <div className="app">
            <TitleBar/>
            <Testing/>
        </div>
    );
}
// export default App;
ReactDOM.render(<App/>, mainElement);
