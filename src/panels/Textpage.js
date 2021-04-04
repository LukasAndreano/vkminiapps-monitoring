import React from "react";
import {
  Panel,
  Group,
  Div,
  PanelHeader,
  PanelHeaderBack,
  Title,
  Text,
  Button,
  Avatar,
} from "@vkontakte/vkui";

import { Icon36DoneOutline, Icon36CancelOutline } from "@vkontakte/icons";

import "../css/Intro.css";

const Textpage = ({ id, go, title, text, button, success }) => {
  return (
    <Panel id={id} centered={true}>
      <PanelHeader
        separator={false}
        left={
          <PanelHeaderBack
            onClick={() => {
              go("home");
            }}
          />
        }
      >
        Информация
      </PanelHeader>
      <Group>
        <Div className="WelcomeBlock">
          {success && (
            <Avatar size={64}>
              <Icon36DoneOutline />
            </Avatar>
          )}
          {!success && (
            <Avatar size={64}>
              <Icon36CancelOutline />
            </Avatar>
          )}
          <Title level="1" weight="bold" style={{ marginBottom: 16 }}>
            {title}
          </Title>
          <Text weight="regular">{text}</Text>
          <Button
            size="l"
            stretched
            mode="secondary"
            onClick={() => {
              go("home");
            }}
          >
            {button}
          </Button>
        </Div>
      </Group>
    </Panel>
  );
};

export default Textpage;
