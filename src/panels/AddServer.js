import React from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
	Avatar,
	Group,
	Header,
	PanelHeader,
	PanelHeaderBack,
	Panel,
	SimpleCell,
	Snackbar,
	Switch,
	Card,
	FormItem,
	FormLayoutGroup,
	Textarea,
	Checkbox,
	FormLayout,
	Input,
	CellButton,
	Select,
	Radio,
	Div,
	Title,
	Text,
	CardScroll,
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

} from '@vkontakte/icons';

class AddServer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			snackbar: null,
		};
		this.submitForm = this.submitForm.bind(this);
	}
	submitForm(event) {
		this.props.clickOnLink();
		fetch('https://lukass.ru/api?act=addServer&' + window.location.href.slice(window.location.href.indexOf('?') + 1) + '&game=' + event.target.game.value + '&name=' + event.target.name.value + '&ip=' + event.target.ip.value + '&port=' + event.target.port.value)
			.then(response => response.json())
			.then(data => {
				if (data.result == 'ok') {
					this.setState({snackbar: <Snackbar
							layout='vertical'
							onClose={() => this.setState({snackbar: null})}>
							Сервер успешно добавлен
						</Snackbar>});
				} else {
					this.setState({snackbar: <Snackbar
							layout='vertical'
							onClose={() => this.setState({snackbar: null})}>
							Упс, что-то пошло не так...
						</Snackbar>});
				}
			})
			.catch(() => {
				this.setState({snackbar: <Snackbar
						layout='vertical'
						onClose={() => this.setState({snackbar: null})}>
						Упс, что-то пошло не так...
					</Snackbar>});
			});
	}
	componentDidUpdate() {

	}
	componentDidMount() {
	}
	componentWillUnmount() {

	}
	render() {
		let {id, go, snackbarError} = this.props;
		return (
			<Panel id={id} className="homePage">
				<PanelHeader separator={false} left={<PanelHeaderBack onClick={go} data-to="home"/>}>Добавление сервера</PanelHeader>
				<Group>
					<FormLayout onSubmit={(e) => {e.preventDefault(); this.submitForm(e);}}>

						<FormItem top="Выберите игру">
							<Select
								required
								name="game"
								placeholder="Игра"
								options={[{value: 'unturned', label: 'Unturned'},

								]}
							/>
						</FormItem>

						<FormItem top="Название сервера">
							<Input type="text" name="name" required placeholder="Мой лучший игровой проект без доната!" />
						</FormItem>

						<FormLayoutGroup mode="horizontal">
							<FormItem top="IP-Адрес сервера">
								<Input name="ip" placeholder="192.168.0.1" required />
							</FormItem>
							<FormItem top="PORT Сервера">
								<Input name="port" placeholder="27015" required />
							</FormItem>
						</FormLayoutGroup>

						<FormItem>
							<Button size="l" stretched mode="secondary">Добавить</Button>
						</FormItem>
					</FormLayout>
				</Group>
				{this.state.snackbar}
				{snackbarError}
			</Panel>
		)
	}
}
export default AddServer;