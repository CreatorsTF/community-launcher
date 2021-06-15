import React from "react";
// import titleBarIcon from "../images/logos/tf2logo_dark_fade.svg";
// import titleBarIcon from "/src/images/logos/modlogos/creatorstf.png";

class TitleBar extends React.Component {
    render() {
        return (
            <header>
                <img src={titleBarIcon}/>
                <h1>Creators.TF Launcher</h1>
                <div id="drag"></div>
                <section id="control-buttons">
                    <button id="minimize"><i className="mdi mdi-window-minimize"></i></button>
                    <button id="maximize"><i className="mdi mdi-window-maximize mdi-window-restore"></i></button>
                    <button id="close"><i className="mdi mdi-window-close"></i></button>
                </section>
            </header>
        );
    }
}
export default TitleBar;