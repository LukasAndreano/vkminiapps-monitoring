import React from 'react';
import {
    Avatar,
    Group,
    PanelHeader,
    Panel,
    Snackbar,
    Card,
    Div,
    Title,
    ScreenSpinner,
    Text,
    RichCell,
    SubnavigationBar,
    SubnavigationButton,
} from '@vkontakte/vkui';
import {
    Icon28ComputerOutline,
    Icon28CancelCircleOutline
} from '@vkontakte/icons';

class InGroupWidget extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackbar: null,
            rows: null,
            spinner: true,
        };
    }

    componentDidMount() {
        fetch('https://monitoring.lukass.ru/getServersInGroupWidget?' + window.location.href.slice(window.location.href.indexOf('?') + 1))
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
                                    onClick={() => this.props.setActiveModal('connectToTheServer', el.host, el.port)}
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
                                >
                                    {el.name}
                                </RichCell>
                            </Card>);
                        }
                    })
                    this.setState({rows: rows, spinner: false});
                }
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
                <PanelHeader separator={false}>Игровые сервера</PanelHeader>
                {this.state.spinner === true && <ScreenSpinner size='large'/>}
                {this.state.spinner === false &&
                <div>
                    <Group>
                        {this.state.rows == null &&
                        <Div>
                            <Card style={{marginBottom: -15}}>
                                <Div>
                                    <Title level="2" weight="heavy" style={{paddingBottom: 10}}>Не удалось получить список серверов</Title>
                                    <Text weight="regular">К сожалению, мы не смогли получить список серверов. Попробуйте позже!</Text>
                                </Div>
                            </Card>
                        </Div>
                        }
                        {this.state.rows != null &&
                        <Div style={{marginBottom: -35}}>
                            {this.state.rows}
                        </Div>
                        }
                        <SubnavigationBar mode="fixed" style={{marginBottom: -20}}>
                            <SubnavigationButton
                                size="l"
                                textLevel={1}
                                onClick={() => go('home')}
                            >
                                Хочу такой же виджет!
                            </SubnavigationButton>
                        </SubnavigationBar>
                    </Group>
                </div>
                }
                {this.state.snackbar}
                {snackbarError}
            </Panel>
        )
    }
}

export default InGroupWidget;