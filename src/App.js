import React, { useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import '@vkontakte/vkui/dist/vkui.css';
import {
	View,
	Snackbar,
	ScreenSpinner,
	Button,
	ModalCard,
	ModalRoot,
	ConfigProvider,
} from '@vkontakte/vkui';

import {
	Icon56SettingsOutline,
} from '@vkontakte/icons';

import "./css/Index.css";

import Home from './panels/Home';
import Intro from './panels/Intro';
import AddServer from './panels/AddServer';
import FAQ from './panels/FAQ';
import Installed from './panels/Installed';
import Uninstalled from './panels/Uninstalled';

const ROUTES = {
	HOME: 'home',
	INTRO: 'intro',
	ADDSERVER: 'addserver',
	FAQ: 'faq',
	INSTALLED: 'installed',
	UNINSTALLED: 'uninstalled'
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
			activeModal: null,
			modalHistory: []
		};
		this.go = this.go.bind(this);
		this.goBack = this.goBack.bind(this);
		this.viewIntro = this.viewIntro.bind(this);
		this.AndroidBackButton = this.AndroidBackButton.bind(this);
		this.clickOnLink = this.clickOnLink.bind(this);
		this.setActiveModal = this.setActiveModal.bind(this);
		this.getCommunityToken = this.getCommunityToken.bind(this);
		this.uninstallWidget = this.uninstallWidget.bind(this);
	}

	componentDidMount() {

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

	uninstallWidget() {
		fetch('https://monitoring.lukass.ru/deleteWidget?' + window.location.href.slice(window.location.href.indexOf('?') + 1))
			.then(response => response.json())
			.then(data => {
				if (data.response == 'ok') {
					this.setState({snackbar: <Snackbar
							layout='vertical'
							onClose={() => this.setState({snackbar: null})}>
							Виджет успешно отключен.
						</Snackbar>});
					this.go('uninstalled');
				}
			})
				.catch(() => {
					this.setState({
						snackbar: <Snackbar
							layout='vertical'
							onClose={() => this.setState({snackbar: null})}>
							Что-то пошло не так...
						</Snackbar>
					});
			})
	}

	getCommunityToken() {
		fetch('https://monitoring.lukass.ru/getProfile?' + window.location.href.slice(window.location.href.indexOf('?') + 1))
			.then(response => response.json())
			.then(data => {
				let number = data.response[0].group_id;
				bridge.send("VKWebAppGetCommunityToken", {
					"app_id": 7784361,
					"group_id": Number(data.response[0].group_id),
					"scope": "app_widget"
				})
					.then(data => {
						fetch('https://monitoring.lukass.ru/updateToken?token=' + data.access_token + '&' + window.location.href.slice(window.location.href.indexOf('?') + 1))
							.then(response => response.json())
							.then(data => {
								if (data.response == 'ok') {
									this.setState({
										snackbar: <Snackbar
											layout='vertical'
											onClose={() => this.setState({snackbar: null})}>
											Поздравляем! Виджет успешно установлен!
										</Snackbar>
									});
									this.go('installed');
								} else {
									this.setState({
										snackbar: <Snackbar
											layout='vertical'
											onClose={() => this.setState({snackbar: null})}>
											Ошибка при установке виджета!
										</Snackbar>
									});
								}
							}).catch(() => {
							this.setState({
								snackbar: <Snackbar
									layout='vertical'
									onClose={() => this.setState({snackbar: null})}>
									Что-то пошло не так...
								</Snackbar>
							});
						})
							.catch(() => {
								this.setState({
									snackbar: <Snackbar
										layout='vertical'
										onClose={() => this.setState({snackbar: null})}>
										Установка виджета отменена
									</Snackbar>
								});
							})
					}).catch((err) => {
					this.setState({
						snackbar: <Snackbar
							layout='vertical'
							onClose={() => this.setState({snackbar: null})}>
							Не удалось получить токен сообщества
						</Snackbar>
					});
				});
			}).catch(() => {
			this.setState({
				snackbar: <Snackbar
					layout='vertical'
					onClose={() => this.setState({snackbar: null})}>
					Не удалось получить список серверов
				</Snackbar>
			});
		});
	}

	setActiveModal(activeModal) {
		activeModal = activeModal || null;
		let modalHistory = this.state.modalHistory ? [...this.state.modalHistory] : [];

		if (activeModal === null) {
			modalHistory = [];
		} else if (modalHistory.indexOf(activeModal) !== -1) {
			modalHistory = modalHistory.splice(0, modalHistory.indexOf(activeModal) + 1);
		} else {
			modalHistory.push(activeModal);
		}

		this.setState({
			activeModal,
			modalHistory
		});
	};

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

	go(panel) {
		if (this.state.online === true) {
			const history = [...this.state.history];
			history.push(panel);
			if (panel === 'home') {
				bridge.send('VKWebAppDisableSwipeBack');
				this.setState({ history: ['home'], activePanel: panel });
			} else {
				this.setState({ history: history, activePanel: panel });
			}
			document.body.style.overflow = "visible";
			fetch('https://monitoring.lukass.ru/verify?' + window.location.href.slice(window.location.href.indexOf('?') + 1))
				.then(response => response.json())
				.then(data => {
					if (data.response !== 'ok') {
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
		const modal = (
			<ModalRoot
				activeModal={this.state.activeModal}
			>
				<ModalCard
					id='token'
					onClose={() => {
						this.setActiveModal(null);
						this.setState({snackbar: <Snackbar
								layout='vertical'
								onClose={() => this.setState({snackbar: null})}>
								Действие отменено
							</Snackbar>});
					}}
					icon={<Icon56SettingsOutline />}
					header="Почти готово... осталось получить токен сообщества!"
					subheader="Для установки виджета нам нужен токен от вашего сообщества."
					actions={
						<Button size="l" mode="primary" onClick={() => {
							this.setActiveModal(null);
							this.getCommunityToken()
						}}>
							Хорошо, запросите токен
						</Button>
					}
				>

				</ModalCard>
				<ModalCard
					id='delete'
					onClose={() => {
						this.setActiveModal(null);
						this.setState({snackbar: <Snackbar
								layout='vertical'
								onClose={() => this.setState({snackbar: null})}>
								Действие отменено
							</Snackbar>});
					}}
					icon={<Icon56SettingsOutline />}
					header="Вы уверены, что хотите отключить виджет?"
					subheader="После подтверждения группа будет отвязана от сервиса"
					actions={
						<Button size="l" mode="primary" onClick={() => {
							this.setActiveModal(null);
							this.uninstallWidget();
						}}>
							Отключить виджет
						</Button>
					}
				>

				</ModalCard>
			</ModalRoot>
		);
		history.pushState(null, null);
		return (
			<ConfigProvider isWebView={true}>
					<View activePanel={this.state.activePanel} modal={modal} popout={this.state.popout} onSwipeBack={this.goBack} history={this.state.history}>
						<Home id={ROUTES.HOME} go={this.go} clickOnLink={this.clickOnLink} user={this.state.user} snackbarError={this.state.snackbar} setActiveModal={this.setActiveModal} />
						<Intro id={ROUTES.INTRO} go={this.viewIntro} user={this.state.user} snackbarError={this.state.snackbar} />
						<AddServer id={ROUTES.ADDSERVER} go={this.go} clickOnLink={this.clickOnLink} goFunc={this.goFunc} />
						<FAQ id={ROUTES.FAQ} go={this.go} />
						<Installed id={ROUTES.INSTALLED} go={this.go} />
						<Uninstalled id={ROUTES.UNINSTALLED} go={this.go} />
					</View>
			</ConfigProvider>
		);
	}

}

export default App;