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

const Uninstalled = ({id, snackbarError, go}) => {
	return (
		<Panel id={id} centered={true}>
				<Fragment>
					<Group>
						<Div className="WelcomeBlock">
							<Title level="1" weight="bold" style={{ marginBottom: 16 }}>Виджет отключен!</Title>
							<Text weight="regular">Теперь при заходе в группу никто не увидит онлайн ваших серверов :c</Text>
							<Button size="l" stretched mode="secondary" onClick={() => {go('home')}}>Окей!</Button>
						</Div>
					</Group>
				</Fragment>
			{snackbarError}
		</Panel>
	)
}

export default Uninstalled;