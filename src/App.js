import React, {useState} from 'react';
import bridge from '@vkontakte/vk-bridge';
import '@vkontakte/vkui/dist/vkui.css';
import {platform} from '@vkontakte/vkui';
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
            groupID: null,
            activeModal: null,
            modalHistory: [],
            ip: '',
            name: '',
            port: '',
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
            bridge.send('VKWebAppDisableSwipeBack')
            this.setState({
                activePanel: ROUTES.HOME, online: false, history: ['home'], snackbar: <Snackbar
                    layout='vertical'
                    duration="1000"
                    onClose={() => this.setState({snackbar: null})}>
                    Потеряно соединение с интернетом
                </Snackbar>
            })
        })

        window.addEventListener('online', () => {
            this.setState({
                online: true
            })
            this.setState({
                textpage: {
                    title: "Оу, кто вернулся?",
                    text: "Теперь ты можешь продолжить наслаждаться приложением!",
                    button: "Окей, понятно!",
                    success: true,
                }
            });
            this.go('textpage');
        })

        this.setState({popout: null});
    }

    submitForm(event) {
        this.setActiveModal(null);
        if (this.state.ip !== undefined && this.state.port !== undefined && this.state.name !== undefined) {
            if (this.state.ip.trim() === '' || this.state.port.trim() === '' || this.state.name.trim() === '') {
                this.setState({
                    snackbar: <Snackbar
                        layout='vertical'
                        duration="3000"
                        onClose={() => this.setState({snackbar: null})}>
                        Поля "IP", "Port", "Название сервера" не должны быть пустыми.
                    </Snackbar>
                })
            } else {
                fetch('https://monitoring.lukass.ru/addServer?' + window.location.href.slice(window.location.href.indexOf('?') + 1) + '&game=' + encodeURI(event.target.game.value) + '&name=' + encodeURI(this.state.name.trim()) + '&ip=' + this.state.ip.trim() + '&port=' + this.state.port.trim())
                .then(response => response.json())
                .then(data => {
                    if (data.response === 'ok') {
                        this.setState({
                            ip: undefined,
                            port: undefined,
                            name: undefined,
                            game: undefined,
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
                                duration="1500"
                                onClose={() => this.setState({snackbar: null})}>
                                Достигнут лимит количества серверов
                            </Snackbar>
                        });
                    } else if (data.response === 'server_already_added') {
                        this.setState({
                            snackbar: <Snackbar
                                layout='vertical'
                                duration="1500"
                                onClose={() => this.setState({snackbar: null})}>
                                Сервер с таким айпи и портом уже существует.
                            </Snackbar>
                        });
                    } else if (data.response === 'wrong_ip') {
                        this.setState({
                            snackbar: <Snackbar
                                layout='vertical'
                                duration="1500"
                                onClose={() => this.setState({snackbar: null})}>
                                Неверный адрес сервера
                            </Snackbar>
                        });
                    } else {
                        this.setState({
                            snackbar: <Snackbar
                                layout='vertical'
                                duration="1500"
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
        } else {
            this.setState({
                snackbar: <Snackbar
                    layout='vertical'
                    duration="3000"
                    onClose={() => this.setState({snackbar: null})}>
                    Поля "IP", "Port", "Название сервера" не должны быть пустыми.
                </Snackbar>
            })
        }
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
        var group_id = Number(this.state.groupID);
        bridge.send("VKWebAppGetCommunityToken", {
            "app_id": 7784361,
            "group_id": group_id,
            "scope": "app_widget, manage"
        })
        .then(data => {
            fetch('https://monitoring.lukass.ru/updateToken?token=' + data.access_token + '&' + window.location.href.slice(window.location.href.indexOf('?') + 1))
                .then(response => response.json())
                .then(data => {
                    if (data.response === 'ok') {
                        this.setState({
                            snackbar: <Snackbar
                                layout='vertical'
                                duration="2000"
                                onClose={() => this.setState({snackbar: null})}>
                                Устанавливаем виджет...
                            </Snackbar>
                        });
                        fetch('https://monitoring.lukass.ru/installWidget?group_id=' + group_id + "&" + window.location.href.slice(window.location.href.indexOf('?') + 1))
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
    }

    setActiveModal(activeModal, host, port, groupID) {
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
            groupID,
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
        if (this.state.activeModal !== null) {
            this.setActiveModal(null);
        } else {
            if (this.state.activePanel !== ROUTES.HOME && this.state.activePanel !== ROUTES.INTRO) {
                this.goBack();
            } else {
                bridge.send("VKWebAppClose", {"status": "success"});
            }
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
                    subheader={"Данные для подключения к игровому серверу: " + this.state.server.ip + ":" + this.state.server.port}
                    actions={
                            <a href={"steam://connect/" + this.state.server.ip + ":" + this.state.server.port} target="_blank">
                                {platform() == 'vkcom' &&
                                <Button size="l" mode="primary" onClick={() => {
                                    this.setActiveModal(null);
                                }}>
                                    Подключиться к серверу
                                </Button>
                                }
                                {platform() != 'vkcom' &&
                                <Button size="l" mode="primary" onClick={() => {
                                    this.setActiveModal(null);
                                }}>
                                    Окей, понятно!
                                </Button>}
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
                                    value={this.state.game}
                                    onChange={(e) => {this.setState({game: e.target.value})}}
                                    options={[{value: 'unturned', label: 'Unturned'},
                                        {value: 'csgo', label: 'Counter-Strike: Global Offensive'},
                                        {value: 'rust', label: 'Rust'},
                                        {value: 'arkse', label: 'Ark: Survival Evolved'},
                                        {value: 'arma3', label: 'ARMA 3'},
                                        {value: 'bf3', label: 'Battlefield 3'},
                                        {value: 'bf4', label: 'Battlefield 4'},
                                        {value: 'cs16', label: 'Counter-Strike 1.6'},
                                        {value: 'cscz', label: 'Counter-Strike: Condition Zero'},
                                        {value: 'css', label: 'Counter-Strike: Source'},
                                        {value: 'garrysmod', label: "Garry's Mod"},
                                        {value: 'fivem', label: 'Grand Theft Auto V - FiveM'},
                                        {value: 'killingfloor2', label: 'Killing Floor 2'},
                                        {value: 'left4dead2', label: 'Left 4 Dead 2'},
                                        {value: 'minecraft', label: 'Minecraft'},
                                        {value: 'minecraftbe', label: 'Minecraft: Bedrock Edition'},
                                        {value: 'tf2', label: 'Team Fortress 2'},
                                        {value: 'valheim', label: 'Valheim'}]}
                                />
                            </FormItem>

                            <FormItem top="Название сервера">
                                <Input type="text" name="name" value={this.state.name} onChange={(e) => {this.setState({ name: e.target.value.replace(/[@+#+*+?+&++]/gi, "").replace(/\n/, '')} )}} placeholder="Мой лучший игровой проект!" maxLength={50}/>
                            </FormItem>

                            <FormLayoutGroup mode="horizontal">
                                <FormItem top="IP-Адрес сервера">
                                    <Input name="ip" placeholder="192.168.0.1" required value={this.state.ip} onChange={(e) => {this.setState({ ip: e.target.value.replace(/[^\w\s\.+]/gi, "")} )}} maxLength={32} />
                                </FormItem>
                                <FormItem top="PORT Сервера">
                                    <Input name="port" type="tel" placeholder="27015" required value={this.state.port} onChange={(e) => {this.setState({ port: e.target.value.replace(/\D+/g, "")} )}} maxLength={5}/>
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