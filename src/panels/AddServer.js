import React from 'react';
import {
	Group,
	PanelHeader,
	PanelHeaderBack,
	Panel,
	Snackbar,
	FormItem,
	FormLayoutGroup,
	FormLayout,
	Input,
	Select,
	Button,
} from '@vkontakte/vkui';

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
		fetch('https://monitoring.lukass.ru/addServer?' + window.location.href.slice(window.location.href.indexOf('?') + 1) + '&game=' + event.target.game.value + '&name=' + event.target.name.value + '&ip=' + event.target.ip.value + '&port=' + event.target.port.value)
			.then(response => response.json())
			.then(data => {
				if (data.response === 'ok') {
					this.setState({snackbar: <Snackbar
							layout='vertical'
							onClose={() => this.setState({snackbar: null})}>
							Сервер успешно добавлен
						</Snackbar>});
				} else if (data.response === 'limit') {
					this.setState({snackbar: <Snackbar
							layout='vertical'
							onClose={() => this.setState({snackbar: null})}>
							Достигнут лимит количества серверов
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
	render() {
		let {id, go, snackbarError} = this.props;
		return (
			<Panel id={id}>
				<PanelHeader separator={false} left={<PanelHeaderBack onClick={() => {go('home')}} />}>Добавление сервера</PanelHeader>
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