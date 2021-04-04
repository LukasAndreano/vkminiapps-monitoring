import React, { Fragment } from "react";
import {
  Panel,
  Group,
  Div,
  Avatar,
  Title,
  Text,
  Button,
} from "@vkontakte/vkui";

import "../css/Intro.css";

const Intro = ({ id, user, userHasSeenIntro, go }) => {
  return (
    <Panel id={id} centered={true}>
      {!userHasSeenIntro && user && (
        <Fragment>
          <Group>
            <Div className="WelcomeBlock">
              <Avatar src={user.photo_200} size={100} />
              <Title level="1" weight="bold" style={{ marginBottom: 16 }}>
                Приветствуем, {user.first_name.replace("&#39;", "'")}!
              </Title>
              <Text weight="regular">
                Это приложение, благодаря которому Вы сможете подключить свои
                сервера и добавить виджет в группу, который будет отображать
                онлайн серверов.
              </Text>
              <Button size="l" stretched mode="secondary" onClick={go}>
                Окей, понятно!
              </Button>
            </Div>
          </Group>
        </Fragment>
      )}
    </Panel>
  );
};

export default Intro;
