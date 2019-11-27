// Equipe: Keven Max Noronha de Lima - 403258
//         Luis Fernando Lopes Muniz - 402381

const readline = require("readline");

class App {
  constructor() {
    this.state = {
      diskSize: 0, // tamanho do disco
      disk: null,
      allocationPolicy: "" //política de alocação
    };
    this.welcome();
  }

  async welcome() {
    console.log("Bem vindo ao Simulador de Alocação de Espaço!");
    console.log("===============================================\n");

    this.state.diskSize = parseInt(
      await this.ask(
        "Para prosseguirmos na simulação, informe o tamanho do disco (em blocos): \n"
      )
    );
    this.state.allocationPolicy = parseInt(
      await this.ask(
        "Agora informe a política de alocação: \n[1] - First Fit\n[2] - Best Fit\n[3] - Worst Fit\n"
      )
    );
    console.log("\n===============================================\n");
    this.createDisk();
  }

  createDisk() {
    const { diskSize } = this.state;
    this.state.disk = new Array();
    for (let i = 0; i < diskSize; i++) {
      this.state.disk.push(null);
    }
    this.menu();
  }

  async menu() {
    do {
      let askMenu = await this.ask(
        "Informe a operação desejada: \n\n[1] Adicionar um arquivo\n[2] Excluir um arquivo\n[3] Exibir a tabela de alocação\n[4] Sair\n"
      );
      switch (askMenu) {
        case "1":
          await this.newFile();
          break;
        case "2":
          await this.deleteFile();
          break;
        case "3":
          this.showDisk();
          break;
        case "4":
          process.exit(0);
      }
    } while (true);
  }

  async newFile() {
    console.log("\n===============================================\n");
    let id, offsetSize;
    do {
      id = await this.ask("Informe o identificador do arquivo: \n");
    } while (!this.validId(id));

    do {
      offsetSize = parseInt(
        await this.ask(
          "Informe o tamanho do deslocamento do arquivo (tamanho do arquivo em blocos): \n"
        )
      );
    } while (!this.validOffsetSize(offsetSize));

    const file = {
      id,
      offsetSize,
      startAdress: null
    };
    switch (this.state.allocationPolicy) {
      case 1:
        this.firstFit(file);
        break;
      case 2:
        this.bestFit(file);
        break;
      case 3:
        this.worstFit(file);
        break;
    }
  }

  async deleteFile() {
    console.log("\n===============================================\n");
    const { diskSize, disk } = this.state;
    let cont = 0;
    let id = await this.ask(
      "Informe o identificador do arquivo ao qual deseja deletar: \n"
    );

    for (let i = 0; i < diskSize; i++) {
      if (disk[i] !== null && disk[i].id === id) {
        this.state.disk[i] = null;
        cont++;
      }
    }
    if (cont === 0) {
      console.log("Arquivo não encontrado no disco :(");
    } else {
      console.log("Arquivo deletado com sucesso!");
    }
    console.log("\n===============================================\n");
  }

  firstFit(file) {
    const { diskSize, disk } = this.state;
    let cont = 0;
    for (let i = 0; i < diskSize; i++) {
      if (disk[i] === null) {
        cont++;
        if (cont === file.offsetSize) {
          file.startAdress = i - cont + 1;
          for (let j = i - cont + 1; j <= i; j++) {
            this.state.disk[j] = file;
          }
          break;
        }
      } else {
        cont = 0;
      }
    }
    if (cont < file.offsetSize) {
      console.log("Espaço de memória insuficiente :(");
    } else {
      console.log("Arquivo criado com sucesso!");
    }
    console.log("\n===============================================\n");
  }

  showDisk() {
    const { disk, diskSize } = this.state;
    console.log("===============================================\n");
    for (let i = 0; i < diskSize; i++) {
      console.log(" — ÍNDICE " + i);
      if (disk[i] !== null) {
        console.log("\n    *    Identificador             : " + disk[i].id);
        console.log(
          "    *    Endereço do bloco inicial : " + disk[i].startAdress
        );
        console.log(
          "    *    Tamanho do deslocamento   : " + disk[i].offsetSize + "\n"
        );
      } else {
        console.log("\n    *    Identificador             : ");
        console.log("    *    Endereço do bloco inicial : ");
        console.log("    *    Tamanho do deslocamento   : \n");
      }
    }
    console.log("\n===============================================\n");
  }

  bestFit() {}

  worstFit() {}

  validId(id) {
    const { disk, diskSize } = this.state;
    for (let i = 0; i < diskSize; i++) {
      if (disk[i] !== null && disk[i].id === id) {
        console.log("Arquivo já existente!\n");
        return false;
      }
    }
    return true;
  }
  validOffsetSize(offsetSize) {
    const { diskSize } = this.state;
    if (offsetSize > diskSize) {
      console.log(
        "Tamanho do deslocamento excede o tamanho definido para o disco!\n"
      );
      return false;
    }
    return true;
  }

  ask(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return new Promise(resolve => {
      rl.question(question, answer => {
        resolve(answer);
        rl.close();
      });
    });
  }
}

new App();
