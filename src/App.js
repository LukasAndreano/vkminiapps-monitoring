import React, { useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import queryString from 'query-string'
import '@vkontakte/vkui/dist/vkui.css';
import {
	View,
	Snackbar,
	ScreenSpinner,
	ConfigProvider,
} from '@vkontakte/vkui';

import "./css/Index.css";

import Home from './panels/Home';
import Intro from './panels/Intro';
import AddServer from './panels/AddServer';

const ROUTES = {
	HOME: 'home',
	INTRO: 'intro',
	ADDSERVER: 'addserver',
}

const STORAGE_KEYS = {
	STATUS: 'status',
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activePanel: ROUTES.HOME,
			user: null,
			online: true,
			popout: <ScreenSpinner size='large' />,
			snackbar: null,
			history: ['home'],
		};
		this.go = this.go.bind(this);
		this.goBack = this.goBack.bind(this);
		this.viewIntro = this.viewIntro.bind(this);
		this.AndroidBackButton = this.AndroidBackButton.bind(this);
		this.clickOnLink = this.clickOnLink.bind(this);
	}

	componentDidMount() {

		var getParams = queryString.parse(window.location.search);

		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		});

		bridge.send('VKWebAppGetUserInfo').then(data => {
			this.setState({user: data});
		});

		bridge.send('VKWebAppStorageGet', {
			keys: Object.values(STORAGE_KEYS),
		})
		.then(data => {
			if (data.keys[0].value !== 'true') {
				this.setState({activePanel: ROUTES.INTRO});
			}
		})

		window.addEventListener("popstate", this.AndroidBackButton);

		window.addEventListener('offline', () => {
			bridge.send('VKWebAppDisableSwipeBack');
			this.setState({activePanel: ROUTES.HOME, online: false, history: ['home'], snackbar: <Snackbar
					layout='vertical'
					onClose={() => this.setState({snackbar: null})}>
					Потеряно соединение с интернетом
				</Snackbar>});
		});
		
		window.addEventListener('online', () => {
			this.setState({online: true, snackbar: <Snackbar
				layout='vertical'
				onClose={() => this.setState({snackbar: null})}>
				Соединение восстановлено
			</Snackbar>})
		});

		this.setState({popout: null});

	}

	viewIntro() {
		try {
			bridge.send('VKWebAppStorageSet', {
				key: STORAGE_KEYS.STATUS,
				value: "true",
			});
			this.setState({activePanel: ROUTES.HOME});
		} catch(error) {
			this.setState({snackbar: <Snackbar
				layout='vertical'
				onClose={() => this.setState({snackbar: null})}>
				Упс, что-то пошло не так...
			</Snackbar>})
		}

	}

	go(e) {
		if (this.state.online === true) {
			const history = [...this.state.history];
			history.push(e.currentTarget.dataset.to);
			if (e.currentTarget.dataset.to === 'home') {
				bridge.send('VKWebAppDisableSwipeBack');
				this.setState({ history: ['home'], activePanel: e.currentTarget.dataset.to });
			} else {
				this.setState({ history: history, activePanel: e.currentTarget.dataset.to });
			}
			document.body.style.overflow = "visible";

			fetch('https://lukass.ru/api?act=verify&' + window.location.href.slice(window.location.href.indexOf('?') + 1))
				.then(response => response.json())
				.then(data => {
					if (data.result !== 'ok') {
						this.setState({activePanel: ROUTES.HOME, snackbar: <Snackbar
								layout='vertical'
								onClose={() => this.setState({snackbar: null})}>
								Упс, что-то пошло не так...
							</Snackbar>});
					}
				})
				.catch(() => {
					this.setState({activePanel: ROUTES.HOME, snackbar: <Snackbar
							layout='vertical'
							onClose={() => this.setState({snackbar: null})}>
							Упс, что-то пошло не так...
						</Snackbar>});
				});
		} else {
			this.setState({snackbar: <Snackbar
					layout='vertical'
					onClose={() => this.setState({snackbar: null})}>
					Нет соединения с интернетом
				</Snackbar>});
		}
	};

	goBack = () => {
		const history = [...this.state.history];
		history.pop();
		const activePanel = history[history.length - 1];
		if (activePanel === 'home') {
		  bridge.send('VKWebAppEnableSwipeBack');
		}
		document.body.style.overflow = "visible";
		this.setState({ history: history, activePanel });
	}
	
	AndroidBackButton = () => {
		if (this.state.activePanel !== ROUTES.HOME && this.state.activePanel !== ROUTES.INTRO) {
			this.goBack();
		} else {
			bridge.send("VKWebAppClose", {"status": "success"});
		}
	}

	clickOnLink() {
		document.body.style.pointerEvents = "none";
		setTimeout(() => {document.body.style.pointerEvents = "all";}, 1000);
	}

	render() {
		history.pushState(null, null);
		return (
			<ConfigProvider isWebView={true}>
					<View activePanel={this.state.activePanel} popout={this.state.popout} onSwipeBack={this.goBack} history={this.state.history}>
						<Home id={ROUTES.HOME} go={this.go} clickOnLink={this.clickOnLink} user={this.state.user} snackbarError={this.state.snackbar} />
						<Intro id={ROUTES.INTRO} go={this.viewIntro} user={this.state.user} snackbarError={this.state.snackbar} />
						<AddServer id={ROUTES.ADDSERVER} go={this.go} clickOnLink={this.clickOnLink} />
					</View>
			</ConfigProvider>
		);
	}

}

export default App;