import React from 'react';
import ReactDOM from 'react-dom';
import { CSSTransition } from 'react-transition-group';

import './SideDrawer.css';

const SideDrawer = props => {
	const content = (
		<CSSTransition in={props.show} timeout={200} classNames={{
			enterActive: "Slide-in-left-enter",
			enterDone: "Slide-in-left-enter-active",
			exitActive: "Slide-in-left-exit",
			exitDone: "Slide-in-left-exit-active"
		}} mountOnEnter unmountOnExit>
			<aside className="side-drawer" onClick={props.onClick}>{props.children}</aside>
		</CSSTransition> );
	return ReactDOM.createPortal(content, document.getElementById('drawer-hook'));
};

export default SideDrawer;