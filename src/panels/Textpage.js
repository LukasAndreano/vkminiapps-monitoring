import React, { Fragment } from 'react';
import {
	Panel,
	Group,
	Div,
	Title,
	Text,
	Button,
	Avatar,
} from '@vkontakte/vkui';

import {
	Icon36DoneOutline
} from '@vkontakte/icons';

import '../css/Intro.css';

const Textpage = ({id, go, title, text, button}) => {
	return (
		<Panel id={id} centered={true}>
				<Fragment>
					<Group>
						<Div className="WelcomeBlock">
							<Avatar size={64}><Icon36DoneOutline/></Avatar>
							<Title level="1" weight="bold" style={{ marginBottom: 16 }}>{title}</Title>
							<Text weight="regular">{text}</Text>
							<Button size="l" stretched mode="secondary" onClick={() => {go('home')}}>{button}</Button>
						</Div>
					</Group>
				</Fragment>
		</Panel>
	)
}

export default Textpage;