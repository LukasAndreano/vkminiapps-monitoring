import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import gamedig from 'gamedig';
import {
	Avatar,
	Group,
	Header,
	PanelHeader,
	Panel,
	SimpleCell,
	Snackbar,
	Switch,
	Card,
	Div,
	Title,
	Text,
	CardScroll,
	RichCell,
	PromoBanner,
	PanelHeaderButton,
	ContentCard,
	Button,
	Tabbar,
	TabbarItem,
	CardGrid,
	Epic,
} from '@vkontakte/vkui';
import {
	Icon28CheckCircleFill
} from '@vkontakte/icons';

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			snackbar: null,
			rows: null,
		};
	}
	componentDidUpdate() {

	}
	componentDidMount() {
		fetch('https://lukass.ru/api?act=getServers&' + window.location.href.slice(window.location.href.indexOf('?') + 1))
			.then(response => response.json())
			.then(data => {
				let rows = [];
				let servers = data.result.map(el => {
					gamedig.query({
						type: el.game,
						host: el.ip,
						port: el.port,
					}).then((state) => {
						console.log(state);
					}).catch((error) => {
						console.log("Server is offline");
					});
					rows.push(<RichCell
						style={{marginBottom: 10}}
						before={<Avatar mode="image" size={54} src={"https://steamuserimages-a.akamaihd.net/ugc/867355099991331712/D1FB703031D9990E8C66C80E5ED262E454FFDE4D/"} />}
						text="Карта: PEI"
						caption="Онлайн: 18/24"
						disabled
					>
						{el.name}
					</RichCell>);
				});
				this.setState({rows: rows});
			})
			.catch(() => {
				this.setState({snackbar: <Snackbar
						layout='vertical'
						onClose={() => this.setState({snackbar: null})}>
						Не удалось получить список серверов
					</Snackbar>});
			});
	}
	componentWillUnmount() {

	}
	changeSubscribe(subscribed) {

	}
	render() {
		let {id, go, snackbarError} = this.props;
		return (
			<Panel id={id} className="homePage">
				<PanelHeader separator={false}>Мои сервера</PanelHeader>
				<Group>
					{this.state.rows == null &&
					<Div>
						<Card style={{marginBottom: 10}}>
							<Div>
								<Title level="2" weight="heavy" style={{marginBottom: 10}}>Заголовок</Title>
								<Text weight="regular">Здесь отображены аркады за последние 3 дня, включая сегодняший.
									Чтобы посмотреть аркады за всё время работы Overwatch Daily Arcade, нажмите на
									соответствующую кнопку ниже. Кнопка перенаправит Вас на наше официальное
									сообщество.</Text>
							</Div>
						</Card>
						<Button size="l" onClick={go} data-to="addserver" stretched mode="secondary">Добавить
							сервер</Button>
					</Div>
					}
					{this.state.rows != null &&
						<Div>
							{this.state.rows}
							<Button size="l" onClick={go} data-to="addserver" stretched mode="secondary">Добавить
								сервер</Button>
						</Div>
					}
				</Group>
				{this.state.snackbar}
				{snackbarError}
			</Panel>
		)
	}
}

export default Home;