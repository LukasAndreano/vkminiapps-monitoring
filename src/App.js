import React, {useState} from 'react';
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
    FormItem,
    FormLayoutGroup,
    FormLayout,
    Input,
    Select,
} from '@vkontakte/vkui';

import {
    Icon56SettingsOutline,
    Icon56DeleteOutline,
    Icon56AddCircleOutline,
    Icon56LinkCircleOutline,
} from '@vkontakte/icons';

import "./css/Index.css";

import Home from './panels/Home';
import Intro from './panels/Intro';
import FAQ from './panels/FAQ';
import Textpage from './panels/Textpage';
import InGroupWidget from './panels/InGroupWidget';

const ROUTES = {
    HOME: 'home',
    INTRO: 'intro',
    FAQ: 'faq',
    TEXTPAGE: 'textpage',
    INGROUPWIDGET: 'ingroupwidget',
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
            popout: <ScreenSpinner size='large'/>,
            snackbar: null,
            history: ['home'],
            activeModal: null,
            modalHistory: [],
            form: {
                ip: '',
                port: '',
            },
            server: {
                ip: null,
                port: null,
                name: null,
            },
            textpage: {
                title: null,
                text: null,
                button: null,
                success: true,
            },
            loaded: false,
        };
        this.go = this.go.bind(this);
        this.goBack = this.goBack.bind(this);
        this.viewIntro = this.viewIntro.bind(this);
        this.AndroidBackButton = this.AndroidBackButton.bind(this);
        this.clickOnLink = this.clickOnLink.bind(this);
        this.setActiveModal = this.setActiveModal.bind(this);
        this.getCommunityToken = this.getCommunityToken.bind(this);
        this.uninstallWidget = this.uninstallWidget.bind(this);
        this.removeServer = this.removeServer.bind(this);
        this.submitForm = this.submitForm.bind(this);
    }

    componentDidMount() {

        bridge.subscribe(({detail: {type, data}}) => {
            if (type === 'VKWebAppUpdateConfig') {
                const schemeAttribute = document.createAttribute('scheme');
                schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
                document.body.attributes.setNamedItem(schemeAttribute);
            }
        });

        bridge.send('VKWebAppGetUserInfo').then(data => {
            this.setState({user: data, loaded: true});
        });

        if (new URLSearchParams(window.location.search).get('vk_group_id') !== null) {
            this.go('ingroupwidget');
        } else {
            bridge.send('VKWebAppStorageGet', {
                keys: Object.values(STORAGE_KEYS),
            })
                .then(data => {
                    if (data.keys[0].value !== 'true') {
                        this.setState({activePanel: ROUTES.INTRO});
                    }
                })
        }

        window.addEventListener("popstate", this.AndroidBackButton);

        window.addEventListener('offline', () => {
            bridge.send('VKWebAppDisableSwipeBack');
            this.setState({
                activePanel: ROUTES.HOME, online: false, history: ['home'], snackbar: <Snackbar
                    layout='vertical'
                    onClose={() => this.setState({snackbar: null})}>
                    Потеряно соединение с интернетом
                </Snackbar>
            });
        });

        window.addEventListener('online', () => {
            this.setState({
                online: true, snackbar: <Snackbar
                    layout='vertical'
                    onClose={() => this.setState({snackbar: null})}>
                    Соединение восстановлено
                </Snackbar>
            })
        });

        this.setState({popout: null});

    }

    submitForm(event) {
        this.setActiveModal(null);
        fetch('https://monitoring.lukass.ru/addServer?' + window.location.href.slice(window.location.href.indexOf('?') + 1) + '&game=' + encodeURI(event.target.game.value) + '&name=' + encodeURI(event.target.name.value) + '&ip=' + event.target.ip.value + '&port=' + event.target.port.value)
            .then(response => response.json())
            .then(data => {
                if (data.response === 'ok') {
                    this.setState({
                        textpage: {
                            title: "Сервер добавлен!",
                            text: "Сервер успешно добавлен и привязан к твоему аккаунту.",
                            button: "Оки-доки!",
                            success: true,
                        }
                    });
                    this.go('textpage');
                } else if (data.response === 'limit') {
                    this.setState({
                        snackbar: <Snackbar
                            layout='vertical'
                            onClose={() => this.setState({snackbar: null})}>
                            Достигнут лимит количества серверов
                        </Snackbar>
                    });
                } else {
                    this.setState({
                        snackbar: <Snackbar
                            layout='vertical'
                            onClose={() => this.setState({snackbar: null})}>
                            Упс, что-то пошло не так...
                        </Snackbar>
                    });
                }
            })
            .catch(() => {
                this.setState({
                    snackbar: <Snackbar
                        layout='vertical'
                        onClose={() => this.setState({snackbar: null})}>
                        Упс, что-то пошло не так...
                    </Snackbar>
                });
            });
    }

    removeServer() {
        fetch('https://monitoring.lukass.ru/removeServer?ip=' + this.state.server.ip + '&port=' + this.state.server.port + '&' + window.location.href.slice(window.location.href.indexOf('?') + 1))
            .then(response => response.json())
            .then(data => {
                if (data.response === 'ok') {
                    this.setState({
                        textpage: {
                            title: "Твоя песенка спета!",
                            text: "Сервер успешно удалён из мониторинга. Если у Вас установлен виджет и в нём есть этот сервер, то через несколько минут он исчезнет.",
                            button: "Принято!",
                            success: true,
                        }
                    });
                    this.go('textpage');
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

    uninstallWidget() {
        fetch('https://monitoring.lukass.ru/deleteWidget?' + window.location.href.slice(window.location.href.indexOf('?') + 1))
            .then(response => response.json())
            .then(data => {
                if (data.response === 'ok') {
                    this.setState({
                        textpage: {
                            title: "Виджет отключен!",
                            text: "Теперь при заходе в группу никто не увидит онлайн ваших серверов :c",
                            button: "Окей!",
                            success: true,
                        }
                    });
                    this.go('textpage');
                }
                if (data.response === 'app_removed') {
                    this.setState({
                        textpage: {
                            title: "Оуч! Не получилось!",
                            text: "Не удалось удалить виджет. Попробуйте позже. Возможно, Вы удалили приложение из своего сообщества?",
                            button: "Понятно",
                            success: false,
                        }
                    });
                    this.go('textpage');
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
                let group_id = Number(data.response[0].group_id);
                bridge.send("VKWebAppGetCommunityToken", {
                    "app_id": 7784361,
                    "group_id": group_id,
                    "scope": "app_widget"
                })
                    .then(data => {
                        fetch('https://monitoring.lukass.ru/updateToken?token=' + data.access_token + '&' + window.location.href.slice(window.location.href.indexOf('?') + 1))
                            .then(response => response.json())
                            .then(data => {
                                if (data.response === 'ok') {
                                    fetch('https://monitoring.lukass.ru/installWidget?' + window.location.href.slice(window.location.href.indexOf('?') + 1))
                                        .then(response => response.json())
                                        .then(data => {
                                            if (data.response === 'ok') {
                                                this.setState({
                                                    textpage: {
                                                        title: "Виджет установлен!",
                                                        text: "Теперь при заходе в группу все увидят онлайн ваших серверов!",
                                                        button: "Круто!",
                                                        success: true,
                                                    }
                                                });
                                                this.go('textpage');
                                            }
                                        }).catch(() => {
                                        this.setState({
                                            snackbar: <Snackbar
                                                layout='vertical'
                                                onClose={() => this.setState({snackbar: null})}>
                                                Не удалось установить виджет
                                            </Snackbar>
                                        });
                                    });

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
                    }).catch(() => {
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

    setActiveModal(activeModal, host, port) {
        host = host || null;
        port = port || null;
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
            modalHistory,
            server: {ip: host, port: port},
        });
    };

    viewIntro() {
        try {
            bridge.send('VKWebAppStorageSet', {
                key: STORAGE_KEYS.STATUS,
                value: "true",
            });
            this.setState({activePanel: ROUTES.HOME});
        } catch (error) {
            this.setState({
                snackbar: <Snackbar
                    layout='vertical'
                    onClose={() => this.setState({snackbar: null})}>
                    Упс, что-то пошло не так...
                </Snackbar>
            })
        }

    }

    go(panel) {
        if (this.state.online === true) {
            const history = [...this.state.history];
            history.push(panel);
            if (panel === 'home') {
                bridge.send('VKWebAppDisableSwipeBack');
                this.setState({history: ['home'], activePanel: panel});
            } else {
                this.setState({history: history, activePanel: panel});
            }
            document.body.style.overflow = "visible";
            fetch('https://monitoring.lukass.ru/verify?' + window.location.href.slice(window.location.href.indexOf('?') + 1))
                .then(response => response.json())
                .then(data => {
                    if (data.response !== 'ok') {
                        this.setState({
                            activePanel: ROUTES.HOME, snackbar: <Snackbar
                                layout='vertical'
                                onClose={() => this.setState({snackbar: null})}>
                                Упс, что-то пошло не так...
                            </Snackbar>
                        });
                    }
                })
                .catch(() => {
                    this.setState({
                        activePanel: ROUTES.HOME, snackbar: <Snackbar
                            layout='vertical'
                            onClose={() => this.setState({snackbar: null})}>
                            Упс, что-то пошло не так...
                        </Snackbar>
                    });
                });
        } else {
            this.setState({
                snackbar: <Snackbar
                    layout='vertical'
                    onClose={() => this.setState({snackbar: null})}>
                    Нет соединения с интернетом
                </Snackbar>
            });
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
        this.setState({history: history, activePanel});
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
        setTimeout(() => {
            document.body.style.pointerEvents = "all";
        }, 1000);
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
                    }}
                    icon={<Icon56SettingsOutline/>}
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
                    }}
                    icon={<Icon56SettingsOutline/>}
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
                <ModalCard
                    id='deleteServer'
                    onClose={() => {
                        this.setActiveModal(null);
                    }}
                    icon={<Icon56DeleteOutline/>}
                    header="Удалить сервер?"
                    subheader="После подтверждения сервер будет удалён из мониторинга. Логично, правда?"
                    actions={
                        <Button size="l" mode="primary" onClick={() => {
                            this.setActiveModal(null);
                            this.removeServer();
                        }}>
                            Удалить сервер
                        </Button>
                    }
                >

                </ModalCard>

                <ModalCard
                    id='connectToTheServer'
                    onClose={() => {
                        this.setActiveModal(null);
                    }}
                    icon={<Icon56LinkCircleOutline/>}
                    header="Подключение к серверу"
                    subheader={"Нажмите на кнопку ниже и мы перенаправим Вас на сервер. Если по каким-либо причинам кнопка не работает, то подключитесь напрямую: " + this.state.server.ip + ":" + this.state.server.port}
                    actions={
                        <a href={"steam://connect/" + this.state.server.ip + ":" + this.state.server.port} target="_blank">
                            <Button size="l" mode="primary" onClick={() => {
                                this.setActiveModal(null);
                            }}>
                                Подключиться к серверу
                            </Button>
                        </a>
                    }
                >

                </ModalCard>

                <ModalCard
                    id='addServer'
                    onClose={() => {
                        this.setActiveModal(null);
                    }}
                    icon={<Icon56AddCircleOutline/>}
                    header="Добавление сервера"
                    subheader={<div>
                        <FormLayout onSubmit={(e) => {
                            e.preventDefault();
                            this.submitForm(e);
                        }} style={{textAlign: 'left'}}>

                            <FormItem top="Выберите игру">
                                <Select
                                    required
                                    name="game"
                                    placeholder="Игра"
                                    options={[{value: 'unturned', label: 'Unturned'},
                                        {value: 'csgo', label: 'Counter-Strike: Global Offensive'},
                                        {value: 'rust', label: 'Rust'},
                                        {value: 'arkse', label: 'Ark: Survival Evolved'}]}
                                />
                            </FormItem>

                            <FormItem top="Название сервера">
                                <Input type="text" name="name" value={this.state.form.name} onChange={(e) => {this.setState({ form: {name: e.target.value.replace(/[@+#+*+?+&++]/gi, "")} })}} placeholder="Мой лучший игровой проект!" maxLength={50}/>
                            </FormItem>

                            <FormLayoutGroup mode="horizontal">
                                <FormItem top="IP-Адрес сервера">
                                    <Input name="ip" placeholder="192.168.0.1" required value={this.state.form.ip} onChange={(e) => {this.setState({ form: {ip: e.target.value.replace(/[^\w\s\.+]/gi, "")} })}} maxLength={32} />
                                </FormItem>
                                <FormItem top="PORT Сервера">
                                    <Input name="port" placeholder="27015" required value={this.state.form.port} onChange={(e) => {this.setState({ form: {port: e.target.value.replace(/\D+/g, "")} })}} maxLength={5}/>
                                </FormItem>
                            </FormLayoutGroup>

                            <FormItem>
                                <Button size="l" stretched mode="secondary">Добавить</Button>
                            </FormItem>
                        </FormLayout>
                    </div>}
                >

                </ModalCard>
            </ModalRoot>
        );
        history.pushState(null, null);
        return (
            <ConfigProvider isWebView={true}>
                {this.state.loaded === true &&
                <View activePanel={this.state.activePanel} modal={modal} popout={this.state.popout}
                      onSwipeBack={this.goBack} history={this.state.history}>
                    <Home id={ROUTES.HOME} go={this.go} clickOnLink={this.clickOnLink}
                          snackbarError={this.state.snackbar} setActiveModal={this.setActiveModal}/>
                    <Intro id={ROUTES.INTRO} go={this.viewIntro} user={this.state.user}
                           snackbarError={this.state.snackbar}/>
                    <FAQ id={ROUTES.FAQ} go={this.go}/>
                    <Textpage id={ROUTES.TEXTPAGE} title={this.state.textpage.title} text={this.state.textpage.text}
                              button={this.state.textpage.button} success={this.state.textpage.success} go={this.go}/>
                    <InGroupWidget id={ROUTES.INGROUPWIDGET} go={this.go} setActiveModal={this.setActiveModal}
                                   group_id={new URLSearchParams(window.location.search).get('vk_group_id')}/>
                </View>
                }
            </ConfigProvider>
        );
    }

}

export default App;