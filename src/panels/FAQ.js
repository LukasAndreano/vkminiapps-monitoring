import React from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import PanelHeaderBack from '@vkontakte/vkui/dist/components/PanelHeaderBack/PanelHeaderBack';
import {
	Group,
	ContentCard,
	CardGrid,
	Div,
	Button
} from '@vkontakte/vkui';

class FAQ extends React.Component {
	render() {
		let {id, go} = this.props;
		return (
			<Panel id={id}>
				<PanelHeader separator={false} left={<PanelHeaderBack onClick={() => {go('home')}} />} >
					FAQ
				</PanelHeader>
				<Group>
					<CardGrid size="l">
						<ContentCard
							subtitle="ИНФОРМАЦИЯ ПРО ИГРЫ"
							disabled
							header="Какие игры мы поддерживаем?"
							text="В данный момент мы поддерживаем следующие игры: Unturned. Нет необходимой игры? Напишите одному из разработчиков!"
							maxheight={200}
						/>
						<ContentCard
							subtitle="ИНФОРМАЦИЯ ПРО ВИДЖЕТ"
							disabled
							header="Интервал обновления виджета"
							text="Виджет для пользователей без подписки обновляется раз в 3 минуты, а для пользователей с подпиской раз в 1 минуту."
							maxheight={200}
						/>
						<ContentCard
							subtitle="ИНФОРМАЦИЯ ПРО ПРИЛОЖЕНИЕ"
							disabled
							header="Приложение"
							text="Текущая версия приложения: 1.0.0. Разработчики: Никита Балин, Jack Lizynov"
							maxheight={200}
						/>
					</CardGrid>
					<Div>
						<Button size="l" onClick={this.props.clickOnLink} stretched mode="secondary" href="https://vk.com/monitoring_app" target = "_blank">Официальная группа</Button>
					</Div>
				</Group>
			</Panel>
		)
	}
}

export default FAQ;