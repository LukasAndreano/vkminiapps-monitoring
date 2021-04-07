import React, { useState } from "react";
import bridge from "@vkontakte/vk-bridge";
import fetch2 from "./components/Fetch";
import "@vkontakte/vkui/dist/vkui.css";
import { platform } from "@vkontakte/vkui";
import {
  View,
  Snackbar,
  ScreenSpinner,
  Button,
  ModalCard,
  Div,
  ModalRoot,
  ConfigProvider,
  FormItem,
  FormLayoutGroup,
  FormStatus,
  FormLayout,
  Input,
  Select,
  Alert,
} from "@vkontakte/vkui";

import {
  Icon56SettingsOutline,
  Icon56AddCircleOutline,
  Icon56LinkCircleOutline,
  Icon56CancelCircleOutline,
  Icon28CheckCircleFill,
  Icon28CancelCircleFillRed,
} from "@vkontakte/icons";

import "./css/Index.css";

import Home from "./panels/Home";
import Intro from "./panels/Intro";
import FAQ from "./panels/FAQ";
import Textpage from "./panels/Textpage";
import InGroupWidget from "./panels/InGroupWidget";
import Settings from './panels/Settings';

const ROUTES = {
  HOME: "home",
  INTRO: "intro",
  FAQ: "faq",
  TEXTPAGE: "textpage",
  INGROUPWIDGET: "ingroupwidget",
  SETTINGS: "settings",
};

const STORAGE_KEYS = {
  STATUS: "status",
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: ROUTES.HOME,
      user: null,
      online: true,
      popout: <ScreenSpinner size="large" />,
      snackbar: null,
      history: ["home"],
      disabled: false,
      groupID: null,
      activeModal: null,
      modalHistory: [],
      ip: "",
      name: "",
      port: "",
      game: "",
      server: {
        ip: null,
        port: null,
        name: null,
      },
      textpage: {
        title: null,
        text: null,
        button: null,
        success: true,
      },
      formstatus: {
        title: null,
        text: null,
      },
      loaded: false,
    };
    this.go = this.go.bind(this);
    this.goBack = this.goBack.bind(this);
    this.viewIntro = this.viewIntro.bind(this);
    this.AndroidBackButton = this.AndroidBackButton.bind(this);
    this.clickOnLink = this.clickOnLink.bind(this);
    this.setActiveModal = this.setActiveModal.bind(this);
    this.getCommunityToken = this.getCommunityToken.bind(this);
    this.uninstallWidget = this.uninstallWidget.bind(this);
    this.removeServer = this.removeServer.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.setSnackbar = this.setSnackbar.bind(this);
    this.setTextpage = this.setTextpage.bind(this);
    this.blockButton = this.blockButton.bind(this);
  }

  componentDidMount() {
    bridge.subscribe(({ detail: { type, data } }) => {
      if (type === "VKWebAppUpdateConfig") {
        const schemeAttribute = document.createAttribute("scheme");
        schemeAttribute.value = data.scheme ? data.scheme : "client_light";
        document.body.attributes.setNamedItem(schemeAttribute);
      }
    });

    bridge.send("VKWebAppGetUserInfo").then((data) => {
      this.setState({ user: data, loaded: true });
    });

    if (
      new URLSearchParams(window.location.search).get("vk_group_id") !== null
    ) {
      this.go("ingroupwidget");
    } else {
      bridge
        .send("VKWebAppStorageGet", {
          keys: Object.values(STORAGE_KEYS),
        })
        .then((data) => {
          if (data.keys[0].value !== "true") {
            this.setState({ activePanel: ROUTES.INTRO });
          }
        });
    }

    window.addEventListener("popstate", this.AndroidBackButton);

    window.addEventListener("offline", () => {
      bridge.send("VKWebAppDisableSwipeBack");
      this.setActiveModal(null)
      this.setSnackbar("Потеряно соединение с интернетом", 2000)
      this.setState({
        activePanel: ROUTES.HOME,
        online: false,
        history: ["home"],
        popout: null,
      });
    });

    window.addEventListener("online", () => {
      this.setState({ online: true });
      this.setTextpage(
        "Вы снова с нами!",
        "Интернет восстановлен, можно пользоваться приложением дальше.",
        "Понятно"
      );
    });

    this.setState({ popout: null });
  }

  setTextpage(title, text, button, success) {
    if (success === undefined) success = true;
    this.setState({
      textpage: {
        title: title,
        text: text,
        button: button,
        success: success,
      },
    });
    this.go("textpage");
  }

  setSnackbar(text, duration, success) {
    duration = duration || 4000;
    if (success === true)
      success = <Icon28CheckCircleFill />
    else
      success = <Icon28CancelCircleFillRed />
    this.setState({
      snackbar: (
        <Snackbar
          before={success}
          layout="vertical"
          duration={duration}
          onClose={() => this.setState({ snackbar: null })}
        >
          {text}
        </Snackbar>
      ),
    });
  }

  submitForm() {
    if (
      this.state.ip !== undefined &&
      this.state.port !== undefined &&
      this.state.name !== undefined
    ) {
      if (
        this.state.ip.trim() === "" ||
        this.state.port.trim() === "" ||
        this.state.name.trim() === ""
      ) {
        this.setState({formstatus: {title: "А чего так пусто то?", text: "Поля 'IP', 'Port', 'Название сервера' не должны быть пустыми"}});
      } else {
        fetch2(
          "addServer",
          "game=" +
            encodeURI(this.state.game) +
            "&name=" +
            encodeURI(this.state.name.trim()) +
            "&ip=" +
            this.state.ip.trim() +
            "&port=" +
            this.state.port.trim()
        )
          .then((data) => {
            switch (data.response) {
              case "ok":
                this.setActiveModal(null);
                this.setState({
                  formstatus: {title: null, text: null},
                  ip: '',
                  port: '',
                  name: '',
                  game: '',
                });
                this.setTextpage(
                  "Сервер добавлен!",
                  "Сервер успешно добавлен и привязан к вашему аккаунту.",
                  "Хорошо!"
                );
                break;

              case "limit":
                this.setState({formstatus: {title: "Ах-ох!", text: "Достигнут лимит количества серверов"}});
                break;

              case "server_already_added":
                this.setState({formstatus: {title: "Дубликат? Зачем?", text: "Сервер с таким айпи и портом уже привязан к вашему аккаунту"}});
                break;

              case "wrong_ip":
                this.setState({formstatus: {title: "Неверный адрес сервера"}});
                break;

              default:
                this.setActiveModal(null);
                this.setSnackbar("Не удалось создать сервер. Произошла какая-то ошибка...", 1500, false);
                break;
            }
          })
          .catch(() => {
            this.setActiveModal(null);
            this.setSnackbar("Не удалось создать сервер. Произошла какая-то ошибка...", 2000, false);
          });
      }
    } else {
      this.setState({formstatus: {title: "А чего так пусто то?", text: "Поля 'IP', 'Port', 'Название сервера' не должны быть пустыми"}});
    }
  }

  removeServer() {
    fetch2(
      "removeServer",
      "ip=" + this.state.server.ip + "&port=" + this.state.server.port
    )
      .then((data) => {
        if (data.response === "ok")
          this.setTextpage(
            "Твоя песенка спета!",
            "Сервер успешно удалён из мониторинга. Если у Вас установлен виджет и в нём есть этот сервер, то через несколько минут он исчезнет.",
            "Принято!"
          );
      })
      .catch(() => {
        this.setSnackbar("Упс, что-то пошло не так...", 2000, false);
      });
  }

  uninstallWidget() {
    fetch2("deleteWidget")
      .then((data) => {
        switch (data.response) {
          case "ok":
            this.setActiveModal(null);
            setTimeout(() => {
              this.setTextpage(
                "Виджет отключен!",
                "Теперь при заходе в группу никто не увидит онлайн ваших серверов :c",
                "Окей!"
              );
            }, 350);
            break;

          case "flood_control":
            this.setActiveModal(null);
            setTimeout(() => {
              this.setTextpage(
                "Ох, флуд-контроль!",
                "Не удалось удалить виджет. Повторите попытку через несколько секунд.",
                "Без проблем",
                false
              );
            }, 350);
            break;

          case "app_removed":
            this.setActiveModal("deleteWidgetError");
            break;
        }
      })
      .catch(() => {
        this.setSnackbar("Упс, что-то пошло не так...", 2000, false);
      });
  }

  getCommunityToken() {
    var group_id = Number(this.state.groupID);
    bridge
      .send("VKWebAppGetCommunityToken", {
        app_id: 7784361,
        group_id: group_id,
        scope: "app_widget, manage",
      })
      .then((data) => {
        fetch2("updateToken", "token=" + data.access_token)
          .then((data) => {
            if (data.response === "ok") {
              document.body.style.pointerEvents = "none";
              this.setSnackbar("Устанавливаем виджет...", 2000, true);
              fetch2("installWidget", "group_id=" + group_id)
                .then((data) => {
                  document.body.style.pointerEvents = "all";
                  if (data.response === "ok")
                    this.setTextpage(
                      "Виджет установлен!",
                      "Теперь при заходе в группу все увидят онлайн ваших серверов!",
                      "Круто!"
                    );
                  if (data.response === 'error')
                    this.setTextpage(
                      "Воу, что произошло?",
                      "К сожалению, мы не смогли установить виджет по неизвестной нам причине. Повторите попытку позже, пожалуйста. Обратите внимание, что ошибка может возникать из-за имён серверов (Пример; █☆☆☆ ARK PUBLIC ☆☆☆█)",
                      "Эх, окей!"
                    );
                })
                .catch(() => {
                  this.setSnackbar("Не удалось установить виджет...", 2000, false);
                });
            } else {
              this.setSnackbar(
                "Произошла непредвиденная ошибка при установке виджета",
                2000,
                false
              );
            }
          })
          .catch(() => {
            this.setSnackbar("Ладно! Установка виджета отменена...", 2000, false);
          });
      })
      .catch(() => {
        this.setSnackbar("Не удалось получить токен сообщества", 2000, false);
      });
  }

  setActiveModal(activeModal, host, port, groupID) {
    if (this.state.online === true) {
      host = host || null;
      port = port || null;
      activeModal = activeModal || null;
      let modalHistory = this.state.modalHistory
        ? [...this.state.modalHistory]
        : [];
      if (activeModal === null) {
        modalHistory = [];
        setTimeout(() => {
          this.setState({
            activeModal,
            modalHistory,
          });
          setTimeout(() => {
            this.setState({
              groupID,
              server: { ip: host, port: port },
            });
          }, 300);
        }, 300);
      } else {
        if (modalHistory.indexOf(activeModal) !== -1) {
          modalHistory = modalHistory.splice(
            0,
            modalHistory.indexOf(activeModal) + 1
          );
        } else {
          modalHistory.push(activeModal);
        }
  
        this.setState({
          activeModal,
          modalHistory,
          groupID,
          server: { ip: host, port: port },
        });
      }
    } else {
      setTimeout(() => {
        this.setState({
          activeModal: null,
          modalHistory: [],
        });
      }, 300);
      this.setSnackbar('К сожалению, это действие недоступно без подключения к интернету', 2000, false)
    }
  }

  viewIntro() {
    try {
      bridge.send("VKWebAppStorageSet", {
        key: STORAGE_KEYS.STATUS,
        value: "true",
      });
      this.setState({ activePanel: ROUTES.HOME });
    } catch {
      this.setSnackbar("Упс, что-то пошло не так...", 2000, false);
    }
  }

  go(panel) {
    if (this.state.online === true) {
      const history = [...this.state.history];
      history.push(panel);
      if (panel === "home") {
        bridge.send("VKWebAppDisableSwipeBack");
        this.setState({ history: ["home"], activePanel: panel, ip: null, port: null });
      } else {
        this.setState({ history: history, activePanel: panel });
      }
      document.body.style.overflow = "visible";
      fetch2("verify")
        .then((data) => {
          if (data.response !== "ok")
            this.setSnackbar("Упс, что-то пошло не так...", 2000, false);
        })
        .catch(() => {
          this.setSnackbar("Упс, что-то пошло не так...", 2000, false);
        });
    } else {
      this.setSnackbar("Нет соединения с интернетом", 2000, false);
    }
  }

  goBack = () => {
    const history = [...this.state.history];
    history.pop();
    const activePanel = history[history.length - 1];
    if (activePanel === "home") {
      bridge.send("VKWebAppEnableSwipeBack");
    }
    document.body.style.overflow = "visible";
    this.setState({ history: history, activePanel });
  };

  AndroidBackButton = () => {
    if (this.state.activeModal !== null) {
      this.setActiveModal(null);
    } else {
      if (
        this.state.activePanel !== ROUTES.HOME &&
        this.state.activePanel !== ROUTES.INTRO
      ) {
        this.goBack();
      } else {
        bridge.send("VKWebAppClose", { status: "success" });
      }
    }
  };

  blockButton() {
    setTimeout(() => {
      this.setState({disabled: true})
      setTimeout(() => {
        this.setState({disabled: false})
      }, 2000)
    }, 50)
  }

  clickOnLink() {
    document.body.style.pointerEvents = "none";
    setTimeout(() => {
      document.body.style.pointerEvents = "all";
    }, 1000);
  }

  render() {
    const modal = (
      <ModalRoot activeModal={this.state.activeModal}>
        <ModalCard
          id="token"
          onClose={() => {
            this.setActiveModal(null);
          }}
          icon={<Icon56SettingsOutline />}
          header="Почти готово... осталось получить токен сообщества!"
          subheader="Для установки виджета нам нужен токен от вашего сообщества."
          actions={
            <Button
              className="modalPadding"
              size="l"
              mode="primary"
              onClick={() => {
                this.setActiveModal(null);
                this.getCommunityToken();
              }}
            >
              Хорошо, запросите токен
            </Button>
          }
        ></ModalCard>
        <ModalCard
          id="delete"
          onClose={() => {
            this.setActiveModal(null);
          }}
          icon={<Icon56SettingsOutline />}
          header="Вы уверены, что хотите отключить виджет?"
          subheader="После подтверждения группа будет отвязана от сервиса"
          actions={
            <Button
              className="modalPadding"
              style={{marginTop: '-20px'}}
              size="l"
              mode="primary"
              onClick={() => {
                this.uninstallWidget();
              }}
            >
              Отключить виджет
            </Button>
          }
        ></ModalCard>
        <ModalCard
          id="deleteServer"
          onClose={() => {
            this.setActiveModal(null);
          }}
          icon={<Icon56SettingsOutline />}
          header={this.state.server.ip + ":" + this.state.server.port}
          subheader={"Выберите, что Вы хотите сделать с сервером:"}
          actions={
            <Div className="modalPadding" style={{display: 'flex', width: '100%'}}>
              <Button
              size="l"
              mode="primary"
              stretched 
              style={{ marginRight: 8 }}
              onClick={() => {
                this.setState({ popout:
                  <Alert
                    actions={[{
                      title: 'Да, удалить',
                      mode: 'destructive',
                      autoclose: true,
                      action: () => {this.removeServer(); this.setActiveModal(null);},
                    }, {
                      title: 'Отмена',
                      autoclose: true,
                      mode: 'cancel'
                    }]}
                    actionsLayout="vertical"
                    onClose={() => {this.setState({popout: null})}}
                    header="Подтвердите действие"
                    text={"Вы уверены, что хотите удалить этот сервер?"}
                  />
                });

              }}
            >
              Удалить
            </Button>
            <Button
              size="l"
              mode="primary"
              stretched 
              onClick={() => {
                this.setState({ip: this.state.server.ip, port: this.state.server.port})
                this.go('settings');
                this.setActiveModal(null)
              }}
            >
              Редактировать
            </Button>
            </Div>
          }
        ></ModalCard>

        <ModalCard
          id="connectToTheServer"
          onClose={() => {
            this.setActiveModal(null);
          }}
          icon={<Icon56LinkCircleOutline />}
          header="Подключение к серверу"
          subheader={<div>Данные для подключения к игровому серверу: <span className="selected">{this.state.server.ip}:{this.state.server.port}</span></div>
          }
          actions={
            <a
              className="modalPadding"
              href={
                "steam://connect/" +
                this.state.server.ip +
                ":" +
                this.state.server.port
              }
              target="_blank"
            >
              {platform() == "vkcom" && (
                <Button
                  className="modalPadding"
                  size="l"
                  mode="primary"
                  onClick={() => {
                    this.setActiveModal(null);
                  }}
                >
                  Подключиться к серверу
                </Button>
              )}
              {platform() != "vkcom" && (
                <Button
                  className="modalPadding"
                  size="l"
                  mode="primary"
                  onClick={() => {
                    this.setActiveModal(null);
                  }}
                >
                  Окей, понятно!
                </Button>
              )}
            </a>
          }
        ></ModalCard>

        <ModalCard
          id="deleteWidgetError"
          onClose={() => {
            this.setActiveModal(null);
          }}
          icon={<Icon56CancelCircleOutline />}
          header="Оуч! Не получилось!"
          subheader={
            "Не удалось удалить виджет. Возможно, Вы удалили приложение из своего сообщества? Если это действительно так, то удалите виджет принудительно."
          }
          actions={
            <Button
              className="modalPadding"
              size="l"
              mode="primary"
              onClick={() => {
                this.setActiveModal(null);
                fetch2("deleteWidgetAnyway").then((data) => {
                  if (data.response === "ok")
                    this.setTextpage(
                      "Да ладно, получилось!",
                      "Вы принудительно удалили виджет из своего сообщества.",
                      "Воу, ясненько"
                    );
                  else
                    this.setSnackbar(
                      "Не удалось принудительно отключить виджет",
                      1500,
                      false
                    );
                });
              }}
            >
              Удалить принудительно
            </Button>
          }
        ></ModalCard>

        <ModalCard
          id="addServer"
          onClose={() => {
            this.setActiveModal(null);
          }}
          icon={<Icon56AddCircleOutline />}
          header="Добавление сервера"
          subheader={
            <div style={{marginTop: '-30px'}}>
              <FormLayout
                onSubmit={(e) => {
                  e.preventDefault();
                  if (this.state.disabled === false) {
                    this.submitForm();
                    this.blockButton();
                  }
                }}
                style={{ textAlign: "left" }}
              >

                <FormItem style={{marginBottom: '-10px', marginTop: 20}}>
                  {this.state.formstatus.title !== null &&
                  <FormStatus header={this.state.formstatus.title} mode="error">
                    {this.state.formstatus.text}
                  </FormStatus>
                  }
                </FormItem>

                <FormItem top="Выберите игру">
                  <Select
                    required
                    name="game"
                    placeholder="Игра"
                    value={this.state.game}
                    onChange={(e) => {
                      this.setState({ game: e.target.value });
                    }}
                    options={[
                      { value: "unturned", label: "Unturned" },
                      {
                        value: "csgo",
                        label: "Counter-Strike: Global Offensive",
                      },
                      { value: "rust", label: "Rust" },
                      { value: "arkse", label: "Ark: Survival Evolved" },
                      { value: "arma3", label: "ARMA 3" },
                      { value: "bf3", label: "Battlefield 3" },
                      { value: "bf4", label: "Battlefield 4" },
                      { value: "cs16", label: "Counter-Strike 1.6" },
                      {
                        value: "cscz",
                        label: "Counter-Strike: Condition Zero",
                      },
                      { value: "css", label: "Counter-Strike: Source" },
                      { value: "garrysmod", label: "Garry's Mod" },
                      { value: "fivem", label: "Grand Theft Auto V - FiveM" },
                      { value: "killingfloor2", label: "Killing Floor 2" },
                      { value: "left4dead2", label: "Left 4 Dead 2" },
                      { value: "minecraft", label: "Minecraft" },
                      {
                        value: "minecraftbe",
                        label: "Minecraft: Bedrock Edition",
                      },
                      { value: "tf2", label: "Team Fortress 2" },
                      { value: "valheim", label: "Valheim" },
                    ]}
                  />
                </FormItem>
                
                <FormItem top="Название сервера">
                  <Input
                    type="text"
                    name="name"
                    value={this.state.name}
                    autoComplete="off"
                    required
                    onChange={(e) => {
                      this.setState({
                        name: e.target.value
                          .replace(/[@+#+*+?+&+%++]/gi, "")
                          .replace(/\n/, ""),
                      });
                    }}
                    placeholder="Мой лучший игровой проект!"
                    maxLength={40}
                  />
                </FormItem>

                <FormLayoutGroup mode="horizontal">
                  <FormItem top="IP-Адрес сервера">
                    <Input
                      name="ip"
                      placeholder="192.168.0.1"
                      required
                      value={this.state.ip}
                      autoComplete="off"
                      onChange={(e) => {
                        this.setState({
                          ip: e.target.value
                            .replace(/[^\w\s\.+]/gi, "")
                            .replace(/[+_++]/gi, ""),
                        });
                      }}
                      maxLength={32}
                    />
                  </FormItem>
                  <FormItem top="PORT Сервера">
                    <Input
                      name="port"
                      inputMode="numeric"
                      placeholder="27015"
                      required
                      value={this.state.port}
                      autoComplete="off"
                      onChange={(e) => {
                        this.setState({
                          port: e.target.value.replace(/\D+/g, ""),
                        });
                      }}
                      maxLength={5}
                    />
                  </FormItem>
                </FormLayoutGroup>

                <FormItem>
                  <Button onClick={() => {this.blockButton();}} size="l" stretched mode="secondary" disabled={
                      this.state.ip === "" || this.state.port === "" || this.state.name === "" || this.state.game === '' || this.state.disabled === true ? true : false
                  }>
                    Добавить
                  </Button>
                </FormItem>
              </FormLayout>
            </div>
          }
        ></ModalCard>
      </ModalRoot>
    );
    history.pushState(null, null);
    return (
      <ConfigProvider isWebView={true}>
        {this.state.loaded === true && (
          <View
            activePanel={this.state.activePanel}
            modal={modal}
            popout={this.state.popout}
            onSwipeBack={this.goBack}
            history={this.state.history}
          >
            <Home
              id={ROUTES.HOME}
              go={this.go}
              clickOnLink={this.clickOnLink}
              snackbar={this.state.snackbar}
              setSnackbar={this.setSnackbar}
              setActiveModal={this.setActiveModal}
            />
            <Intro
              id={ROUTES.INTRO}
              go={this.viewIntro}
              user={this.state.user}
              snackbar={this.state.snackbar}
            />
            <FAQ id={ROUTES.FAQ} go={this.go} />
            <Textpage
              id={ROUTES.TEXTPAGE}
              title={this.state.textpage.title}
              text={this.state.textpage.text}
              button={this.state.textpage.button}
              success={this.state.textpage.success}
              go={this.go}
            />
            <InGroupWidget
              id={ROUTES.INGROUPWIDGET}
              go={this.go}
              setActiveModal={this.setActiveModal}
              group_id={new URLSearchParams(window.location.search).get(
                "vk_group_id"
              )}
            />
            <Settings
              id={ROUTES.SETTINGS}
              go={this.go}
              setSnackbar={this.setSnackbar}
              ip={this.state.ip}
              port={this.state.port}
              disabled={this.state.disabled}
              blockButton={this.blockButton}
              snackbar={this.state.snackbar}
            />
          </View>
        )}
      </ConfigProvider>
    );
  }
}

export default App;
