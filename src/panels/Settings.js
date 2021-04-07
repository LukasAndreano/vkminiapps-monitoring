import React from "react";
import fetch2 from "../components/Fetch";
import {
  Panel,
  Div,
  Button,
  PanelHeader,
  PanelHeaderBack,
  FormLayout,
  FormItem,
  Input,
  Select,
  FormLayoutGroup,
  FormStatus,
  ScreenSpinner,
} from "@vkontakte/vkui";

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      snackbar: null,
      spinner: true,
      data: null,
      name: '',
      game: '',
      ip: '',
      oldip: '',
      oldport: '',
      port: '',
      formstatus: {
        title: null,
        text: null,
      }
    };
    this.submitForm = this.submitForm.bind(this);
  }

  componentDidMount() {
    fetch2('getServerData', 'ip=' + this.props.ip + '&port=' + this.props.port).then(data => {
      if (data.response === 'empty') {
        this.props.go('home')
        this.props.setSnackbar('Не удалось загрузить информацию. Возможно, Вы удалили этот сервер?', 2000, false);
      } else {
        if (data.response !== undefined && data.response !== undefined && data.response !== undefined) {
          this.setState({name: data.response[0].name, game: data.response[0].game, ip: data.response[0].ip, port: data.response[0].port, oldip: this.props.ip, oldport: this.props.port, spinner: false})
        } 
      }
    })
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
          "editServer",
          "game=" +
            encodeURI(this.state.game) +
            "&ip=" +
            this.state.ip.trim() +
            "&port=" +
            this.state.port.trim() +
            "&oldip=" + this.state.oldip +
            "&oldport=" + this.state.oldport +
            "&name=" +
            encodeURI(this.state.name.trim()) 
        )
          .then((data) => {
            switch (data.response) {
              case "ok":
                this.props.go("home")
                this.props.setSnackbar('Настройки сервера успешно сохранены!', 2000, true);
                break;

              case "wrong_name":
                this.setState({formstatus: {title: "Ошибка!", text: "Название сервера не может содерждать более 50 символов"}});
                break;

              case "wrong_ip":
                this.setState({formstatus: {title: "Неверный адрес сервера", "text": null}});
                break;

              case "server_already_added":
                this.setState({formstatus: {title: "Дубликат? Зачем?", text: "Сервер с таким IP и портом уже привязан к Вашему аккаунту."}});
              break;

              default:
                this.props.setSnackbar("Не удалось сохранить настройки. Произошла какая-то ошибка...", 1500, false);
                break;
            }
          })
          .catch(() => {
            this.props.setSnackbar("Не удалось сохранить настройки. Произошла какая-то ошибка...", 2000, false);
          });
      }
    } else {
      this.setState({formstatus: {title: "А чего так пусто то?", text: "Поля 'IP', 'Port', 'Название сервера' не должны быть пустыми"}});
    }
  }
  render() {
    let { id, go, snackbar } = this.props;
    return (
      <Panel id={id}>
        <PanelHeader
          separator={false}
          left={<PanelHeaderBack onClick={() => go("home")} />}
        >
          Настройки
        </PanelHeader>
        {this.state.spinner === true && <ScreenSpinner size="large" />}
        {this.state.spinner === false && (
          <Div>
            <FormLayout
              onSubmit={(e) => {
                e.preventDefault();
                if (this.props.disabled === false) {
                  this.submitForm(e);
                  this.props.blockButton();
                }
              }}
              style={{ textAlign: "left" }}
            >

                {this.state.formstatus.title !== null &&
                <FormItem>
                  <FormStatus header={this.state.formstatus.title} mode="error">
                    {this.state.formstatus.text}
                  </FormStatus>
                </FormItem>
                }

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
                  placeholder="Топ-1 проект СНГ"
                  required
                  maxLength={50}
                  name="about"
                  value={this.state.name}
                  onChange={(e) => {
                    this.setState({
                      name: e.target.value
                        .replace(/[@+#+*+?+&+%++]/gi, "")
                        .replace(/\n/, ""),
                    });
                  }}
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
                <Button onClick={() => {this.props.blockButton();}} size="l" stretched mode="secondary" disabled={
                      this.state.ip === "" || this.state.port === "" || this.state.name === "" || this.state.game === '' || this.props.disabled === true ? true : false
                  }>
                    Сохранить
                  </Button>
              </FormItem>
            </FormLayout>
          </Div>
        )}
        {snackbar}
      </Panel>
    );
  }
}

export default Settings;
