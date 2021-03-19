import React, { Fragment } from 'react';
import {
	Panel,
	Group,
	Div,
	Title,
	Text,
	Button,
} from '@vkontakte/vkui';

import '../css/Intro.css';

const Installed = ({id, snackbarError, go}) => {
	return (
		<Panel id={id} centered={true}>
				<Fragment>
					<Group>
						<Div className="WelcomeBlock">
							<Title level="1" weight="bold" style={{ marginBottom: 16 }}>Виджет установлен!</Title>
							<Text weight="regular">Теперь при заходе в группу все увидят онлайн ваших серверов!</Text>
							<Button size="l" stretched mode="secondary" onClick={() => {go('home')}}>Круто!</Button>
						</Div>
					</Group>
				</Fragment>
			{snackbarError}
		</Panel>
	)
}

export default Installed;