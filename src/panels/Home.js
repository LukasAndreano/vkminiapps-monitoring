import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
    Avatar,
    PanelHeaderButton,
    Group,
    PanelHeader,
    Panel,
    Snackbar,
    Card,
    Div,
    Placeholder,
    Title,
    ScreenSpinner,
    Button,
    Text,
    RichCell,
    SubnavigationBar,
    SubnavigationButton,
    CardGrid,
    ContentCard,
} from '@vkontakte/vkui';
import {
    Icon28HelpCircleOutline,
    Icon24AddSquareOutline,
    Icon56TearOffFlyerOutline,
    Icon28ComputerOutline,
    Icon28CancelCircleOutline
} from '@vkontakte/icons';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackbar: null,
            rows: null,
            spinner: true,
            donut: null,
            group_id: null,
            servers: 0,
            widget: false,
            maxServers: null,
        };
        this.installWidget = this.installWidget.bind(this);
    }

    installWidget() {
                bridge.send("VKWebAppAddToCommunity")
                    .then(data => {
                        fetch('https://monitoring.lukass.ru/updateGroupID?group_id=' + data.group_id + '&' + window.location.href.slice(window.location.href.indexOf('?') + 1))
                            .then(response => response.json())
                            .then(() => {
                                this.props.setActiveModal('token');
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
                            Установка виджета отменена
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
    }

    componentDidMount() {
        fetch('https://monitoring.lukass.ru/getServers?' + window.location.href.slice(window.location.href.indexOf('?') + 1))
            .then(response => response.json())
            .then(data => {
                if (data.response !== null) {
                    let rows = [];
                    data.map(el => {
                        {
                            el.maxPlayers !== 0 &&
                            rows.push(<Card key={el.id}>
                                <RichCell
                                    style={{marginBottom: 10}}
                                    before={<Avatar mode="app" size={54}><Icon28ComputerOutline/></Avatar>}
                                    text={"Карта: " + el.map}
                                    after={el.players + "/" + el.maxPlayers}
                                    caption={"Игра: " + el.game}
                                    onClick={() => this.props.setActiveModal('deleteServer', el.host, el.port)}
                                >
                                    {el.name}
                                </RichCell>
                            </Card>);
                        }
                        {
                            el.maxPlayers === 0 &&
                            rows.push(<Card key={el.id}>
                                <RichCell
                                    style={{marginBottom: 10}}
                                    before={<Avatar mode="app" size={54}><Icon28CancelCircleOutline/></Avatar>}
                                    text={"• Сервер выключен"}
                                    after={el.players + "/" + el.maxPlayers}
                                    caption={"Игра: " + el.game}
                                    onClick={() => this.props.setActiveModal('deleteServer', el.host, el.port)}
                                >
                                    {el.name}
                                </RichCell>
                            </Card>);
                        }
                    })
                    this.setState({rows: rows, servers: rows.length});
                }
                fetch('https://monitoring.lukass.ru/getProfile?' + window.location.href.slice(window.location.href.indexOf('?') + 1))
                    .then(response => response.json())
                    .then(data => {
                        if (data.response[0].token !== null)
                            var widget = true;
                        else
                            widget = false;
                        this.setState({
                            status: data.response[0].status,
                            group_id: data.response[0].group_id,
                            maxServers: data.response[0].max_servers,
                            donut: data.response[0].donut,
                            widget: widget,
                            spinner: false
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
            })
            .catch(() => {
                this.setState({
                    snackbar: <Snackbar
                        layout='vertical'
                        onClose={() => this.setState({snackbar: null})}>
                        Не удалось получить список серверов
                    </Snackbar>
                });
            });

    }

    render() {
        let {id, go, snackbarError} = this.props;
        return (
            <Panel id={id} popout={this.state.popout}>
                <PanelHeader left={<PanelHeaderButton onClick={() => {
                    go('faq')
                }}><Icon28HelpCircleOutline/></PanelHeaderButton>}
                             separator={false}>Мои сервера</PanelHeader>
                {this.state.spinner === true && <ScreenSpinner size='large'/>}
                {this.state.spinner === false &&
                <div>
                    <Group>
                        {this.state.maxServers >= this.state.servers &&
                        <SubnavigationBar mode="fixed" style={{marginBottom: -20}}>
                            <SubnavigationButton
                                before={<Icon24AddSquareOutline/>}
                                size="l"
                                textLevel={1}
                                onClick={() => this.props.setActiveModal('addServer')}
                            >
                                Добавить сервер
                            </SubnavigationButton>
                        </SubnavigationBar>
                        }
                        {this.state.widget === true &&
                        <CardGrid size="l" style={{marginTop: 10}}>
                            {this.state.donut === 0 &&
                            <a
                                href="https://vk.com/donut/monitoring_app"
                                target="_blank"
                                onClick={this.props.clickOnLink}
                            >
                                <ContentCard
                                    header={"В виджете будет отображено 3 сервера"}
                                    caption="Чтобы увеличить этот лимит до 6, оформите подписку, кликнув по этому баннеру. Поясняем: добавить можно 20 серверов без подписки, но в виджете будет отображаться лишь 3 сервера."
                                />
                            </a>
                            }
                            {this.state.donut === 1 &&
                            <a
                                href="https://vk.com/donut/monitoring_app"
                                target="_blank"
                                onClick={this.props.clickOnLink}
                            >
                                <ContentCard
                                    header={"В виджете будет отображено 6 серверов"}
                                    caption="У Вас активна подписка, кстати 😎"
                                />
                            </a>
                            }
                        </CardGrid>
                        }
                        {this.state.rows === null &&
                        <Div>
                            <Card style={{marginBottom: -15}}>
                                <Div>
                                    <Title level="2" weight="heavy" style={{paddingBottom: 10}}>Немного о
                                        приложении</Title>
                                    <Text weight="regular">Благодаря этому приложению можно отслеживать онлайн
                                        сервера и выводить его в группу ВК. Добавьте сервер, кликнув по кнопке
                                        выше, а затем в пару кликов установите виджет в своё сообщество.</Text>
                                </Div>
                            </Card>
                        </Div>
                        }
                        {this.state.rows !== null &&
                        <Div style={{marginBottom: -20}}>
                            {this.state.rows}
                        </Div>
                        }
                    </Group>
                    {this.state.widget === false && this.state.rows !== null &&
                            <Group>
                                <Placeholder
                                    icon={<Icon56TearOffFlyerOutline/>}
                                    header="Виджет мониторинга"
                                    action={<Button size="m" onClick={() => this.installWidget()}>Подключить
                                        виджет</Button>}
                                >
                                    Подключите виджет, который будет показывать онлайн Ваших серверов при заходе в
                                    группу
                                </Placeholder>
                            </Group>
                    }
                    {this.state.widget === false && this.state.rows === null &&
                    <Group>
                        <Placeholder
                            icon={<Icon56TearOffFlyerOutline/>}
                            header="Виджет мониторинга"
                            action={<Button size="m" onClick={() => this.props.setActiveModal('addServer')}>Нет серверов</Button>}
                        >
                            Подключите виджет, который будет показывать онлайн Ваших серверов при заходе в
                            группу
                        </Placeholder>
                    </Group>
                    }
                    {this.state.widget === true &&
                    <Group>
                        <Placeholder
                            icon={<Icon56TearOffFlyerOutline/>}
                            header="Отключить виджет?"
                            action={<Button size="m" onClick={() => this.props.setActiveModal('delete')}>Отключить
                                виджет</Button>}
                        >
                            Если Вы хотите убрать виджет или привязать его к другой группе, то кликайте на кнопку ниже
                        </Placeholder>
                    </Group>
                    }
                </div>
                }
                {this.state.snackbar}
                {snackbarError}
            </Panel>
        )
    }
}

export default Home;