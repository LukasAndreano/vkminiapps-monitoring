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
    ModalRoot,
    ModalCard,
} from '@vkontakte/vkui';
import {
    Icon28HelpCircleOutline,
    Icon24AddSquareOutline,
    Icon56UsersOutline,
    Icon56MoneyTransferOutline,
} from '@vkontakte/icons';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackbar: null,
            rows: null,
            spinner: true,
            totalServers: 0,
            max_servers: null,
            status: null,
            group_id: null,
        };
        this.installWidget = this.installWidget.bind(this);
    }
    installWidget() {
        bridge.send("VKWebAppAddToCommunity")
            .then(data => {
                fetch('https://monitoring.lukass.ru/updateGroupID?group_id=' + data.group_id + '&' + window.location.href.slice(window.location.href.indexOf('?') + 1))
                    .then(response => response.json())
                    .then(data => {
                        this.props.setActiveModal('token');
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
            })
        }
        componentDidMount()
        {
            fetch('https://monitoring.lukass.ru/getServers?' + window.location.href.slice(window.location.href.indexOf('?') + 1))
                .then(response => response.json())
                .then(data => {
                    if (data.response !== null) {
                        let rows = [];
                        data.map(el => {
                            rows.push(<Card key={el.id}>
                                <RichCell
                                    style={{marginBottom: 10}}
                                    before={<Avatar mode="image" size={54}
                                                    src={"https://i.ibb.co/QHjSJpS/Summer-AVA.jpg"}/>}
                                    text={"Карта: " + el.map}
                                    after={el.players + "/" + el.maxPlayers}
                                    caption={"Игра: " + el.game}
                                >
                                    {el.name}
                                </RichCell>
                            </Card>);
                        })
                        this.setState({rows: rows, totalServers: data.length});
                    } else {
                        this.setState({totalServers: 0});
                    }
                    fetch('https://monitoring.lukass.ru/getProfile?' + window.location.href.slice(window.location.href.indexOf('?') + 1))
                        .then(response => response.json())
                        .then(data => {
                            this.setState({
                                max_servers: data.response[0].max_servers,
                                status: data.response[0].status,
                                group_id: data.response[0].group_id,
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

        componentWillUnmount()
        {
            //code
        }

        render()
        {
            let {id, go, snackbarError} = this.props;
            return (
                <Panel id={id} popout={this.state.popout}>
                    <PanelHeader left={<PanelHeaderButton onClick={() => {go('faq')}}><Icon28HelpCircleOutline/></PanelHeaderButton>}
                                 separator={false}>Мои сервера</PanelHeader>
                    {this.state.spinner === true && <ScreenSpinner size='large'/>}
                    {this.state.spinner === false &&
                    <div>
                        <Group>
                            {(this.state.max_servers - this.state.totalServers) !== 0 &&
                            <SubnavigationBar mode="fixed" style={{marginBottom: -20}}>
                                <SubnavigationButton
                                    before={<Icon24AddSquareOutline/>}
                                    size="l"
                                    textLevel={2}
                                    onClick={() => {go('addserver')}}
                                >
                                    Добавить сервер
                                </SubnavigationButton>
                            </SubnavigationBar>
                            }
                            <CardGrid size="l" style={{marginTop: 10}}>
                                <ContentCard
                                    header={"Доступно серверов к установке: " + (this.state.max_servers - this.state.totalServers)}
                                    caption="Чтобы увеличить этот лимит, оформите подписку MonitorPro, кликнув по этому баннеру."
                                    disabled
                                />
                            </CardGrid>
                            {this.state.rows == null &&
                            <Div>
                                <Card style={{marginBottom: 10}}>
                                    <Div>
                                        <Title level="2" weight="heavy">Что тут делать?</Title>
                                        <Text weight="regular">Благодаря этому приложению можно отслеживать онлайн
                                            сервера и выводить его в группу ВК. Добавь сервер, кликнув по кнопке
                                            выше, а затем в пару кликов установи виджет в своё сообщество.</Text>
                                    </Div>
                                </Card>
                            </Div>
                            }
                            {this.state.rows != null &&
                            <Div>
                                {this.state.rows}
                            </Div>
                            }
                        </Group>
                        {this.state.group_id === null &&
                        <Group>
                            <Placeholder
                                icon={<Icon56UsersOutline/>}
                                header="Виджет мониторинга"
                                action={<Button size="m" onClick={() => this.installWidget()}>Подключить виджет</Button>}
                            >
                                Подключите виджет, который будет показывать онлайн всех Ваших серверов при заходе в
                                группу
                            </Placeholder>
                        </Group>
                        }
                        {this.state.group_id !== null &&
                        <Group>
                            <Placeholder
                                icon={<Icon56UsersOutline/>}
                                header="Отключить виджет?"
                                action={<Button size="m" onClick={() => this.props.setActiveModal('delete')}>Отключить виджет</Button>}
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

    export
    default
    Home;