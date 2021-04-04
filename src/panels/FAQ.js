import React from "react";
import {
  Panel,
  PanelHeader,
  PanelHeaderBack,
  Group,
  ContentCard,
  CardGrid,
  Div,
  Button,
} from "@vkontakte/vkui";

class FAQ extends React.Component {
  render() {
    let { id, go } = this.props;
    return (
      <Panel id={id}>
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
          FAQ
        </PanelHeader>
        <Group>
          <CardGrid size="l">
            <ContentCard
              subtitle="ИНФОРМАЦИЯ ПРО ИГРЫ"
              disabled
              header="Что делать, если в списке нет нужной мне игры?"
              text="Если в предложенном списке нет необходимой Вам игры - напишите одному из разработчиков, и мы обязательно её добавим!"
              maxheight={200}
            />
            <ContentCard
              subtitle="ИНФОРМАЦИЯ ПРО ВИДЖЕТ"
              disabled
              header="Интервал обновления виджета"
              text="Виджет для пользователей без подписки обновляется раз в 3 минуты, а для пользователей с подпиской - раз в 1 минуту."
              maxheight={200}
            />
            <ContentCard
              subtitle="ИНФОРМАЦИЯ ПРО ПРИЛОЖЕНИЕ"
              disabled
              header="Приложение"
              text="Текущая версия приложения: 1.0.1. Разработчики: Никита Балин, Jack Lizynov"
              maxheight={200}
            />
          </CardGrid>
          <Div>
            <Button
              size="l"
              onClick={this.props.clickOnLink}
              stretched
              mode="secondary"
              href="https://vk.com/monitoring_app"
              target="_blank"
            >
              Официальная группа
            </Button>
          </Div>
        </Group>
      </Panel>
    );
  }
}

export default FAQ;
