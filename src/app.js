// Equipe: Keven Max Noronha de Lima - 403258
//         Luis Fernando Lopes Muniz - 402381
//         Emanuel Maximiliano Pirilo Lima Sousa - 404513

const readline = require("readline");

class App {
  constructor() {
    this.state = {
      diskSize: 0, // tamanho do disco
      disk: null, // disco
      allocationPolicy: "" // política de alocação
    };
    this.welcome(); // chamada para função de início
  }

  async welcome() {
    console.log("Bem vindo ao Simulador de Alocação de Espaço!");
    console.log("===============================================\n");

    this.state.diskSize = parseInt(
      await this.ask(
        "Para prosseguirmos na simulação, informe o tamanho do disco (em blocos): \n"
      )
    ); // recebendo e setando o tamanho do disco
    this.state.allocationPolicy = parseInt(
      await this.ask(
        "Agora informe a política de alocação: \n[1] - First Fit\n[2] - Best Fit\n[3] - Worst Fit\n"
      )
    ); // recebendo e setando política de alocação
    console.log("\n===============================================\n");
    this.createDisk(); // função que irá criar o disco
  }

  createDisk() {
    const { diskSize } = this.state; // tamanho do disco
    this.state.disk = new Array(); // criando o array e setando ao disco
    for (let i = 0; i < diskSize; i++) {
      this.state.disk.push(null); // inicializando posições do disco com o valor null
    }
    this.menu(); // função em loop referente as opções do simulador
  }

  async menu() {
    do {
      let askMenu = await this.ask(
        "Informe a operação desejada: \n\n[1] Adicionar um arquivo\n[2] Excluir um arquivo\n[3] Exibir a tabela de alocação\n[4] Sair\n"
      ); // recebendo qual operação será realizada
      switch (askMenu) {
        case "1":
          await this.createFile(); // função responsável por criar o arquivo no disco
          break;
        case "2":
          await this.deleteFile(); // função responsável por deletar o arquivo no disco
          break;
        case "3":
          this.showAllocationTable(); // função responsável por exibir tabela de alocação
          break;
        case "4":
          process.exit(0); // encerrando aplicação
      }
    } while (true);
  }

  async createFile() {
    console.log("\n===============================================\n");
    let id, offsetSize;
    do {
      id = await this.ask("Informe o identificador do arquivo: \n");
    } while (!this.validId(id)); // loop para receber indentificador válido

    do {
      offsetSize = parseInt(
        await this.ask(
          "Informe o tamanho do deslocamento do arquivo (tamanho do arquivo em blocos): \n"
        )
      );
    } while (!this.validOffsetSize(offsetSize)); // loop para receber tamanho do deslocamento do arquivo válido

    const file = {
      id,
      offsetSize,
      startAdress: null
    }; // objeto referente o arquivo com identificador e tamanho do deslocamento setados
    switch (this.state.allocationPolicy) {
      case 1:
        this.firstFit(file); // função responsável por alocar o arquivo usando algoritmo first fit
        break;
      case 2:
        this.bestFit(file); // função responsável por alocar o arquivo usando algoritmo best fit
        break;
      case 3:
        this.worstFit(file); // função responsável por alocar o arquivo usando algoritmo worst fit
        break;
    }
  }

  async deleteFile() {
    console.log("\n===============================================\n");
    const { diskSize, disk } = this.state; // disco e tamanho do disco
    let cont = 0; // contador de ocorrências
    let id = await this.ask(
      "Informe o identificador do arquivo ao qual deseja deletar: \n"
    ); // recebendo o identificador do arquivo

    for (let i = 0; i < diskSize; i++) {
      if (disk[i] !== null && disk[i].id === id) {
        this.state.disk[i] = null;
        cont++;
      }
    } // buscando dentro do vetor alguma ocorrência do arquivo pelo identificador e setando null
    if (cont === 0) {
      console.log("Arquivo não encontrado no disco :(");
    } else {
      console.log("Arquivo deletado com sucesso!");
    }
    console.log("\n===============================================\n");
  }

  firstFit(file) {
    const { diskSize, disk } = this.state; // disco e tamanho do disco
    let cont = 0;
    for (let i = 0; i < diskSize; i++) {
      // percorrendo o disco
      if (disk[i] === null) {
        // verificando se o espaço é livre
        cont++;
        if (cont === file.offsetSize) {
          // verificando se a sequência de espaços livres é igual ao tamanho do deslocamento do arquivo
          file.startAdress = i - cont + 1;
          // definindo endereço inicial do arquivo como o inicio da sequência de blocos livre
          for (let j = i - cont + 1; j <= i; j++) {
            // loop iniciando do primeiro bloco livre na sequência até o bloco corrente (variável i)
            this.state.disk[j] = file; // setando no disco o arquivo
          }
          break;
        }
      } else {
        cont = 0; // definindo contador como zero caso encontre algum bloco ocupado
      }
    }
    if (cont < file.offsetSize) {
      // verificando se a quantidade de blocos em sequência é menor que o tamanho do arquivo
      console.log("Espaço de memória insuficiente :(");
    } else {
      console.log("Arquivo criado com sucesso!");
    }
    console.log("\n===============================================\n");
  }

  showAllocationTable() {
    const { disk, diskSize } = this.state; // disco e tamanho do disco
    console.log("===============================================\n");
    for (let i = 0; i < diskSize; i++) {
      // percorrendo o disco
      console.log(" — ÍNDICE " + i);
      if (disk[i] !== null) {
        // caso o bloco esteja ocupado exibe a mensagem
        console.log("\n    *    Identificador             : " + disk[i].id);
        console.log(
          "    *    Endereço do bloco inicial : " + disk[i].startAdress
        );
        console.log(
          "    *    Tamanho do deslocamento   : " + disk[i].offsetSize + "\n"
        );
      } else {
        // caso o bloco esteja livre exibe a mensagem
        console.log("\n    *    Identificador             : ");
        console.log("    *    Endereço do bloco inicial : ");
        console.log("    *    Tamanho do deslocamento   : \n");
      }
    }
    console.log("\n===============================================\n");
  }

  bestFit(file) {
    const smaller = this.spacesFree(); // array de sequência de blocos livres
    smaller.sort(function(a, b) {
      return a.offsetSize - b.offsetSize;
    }); // ordernando array de forma crescente
    let position = null;
    for (let i = 0; i < smaller.length; i++) {
      // percorrendo array de sequência de blocos livres
      if (smaller[i].offsetSize >= file.offsetSize) {
        // verificando se o tamanho do deslocamento da sequência é compatível com o tamanho do deslocamento do arquivo
        position = smaller[i]; // guardando a sequência
        break;
      }
    }
    if (position !== null) {
      // verificando se a sequência é valida
      file.startAdress = position.startAdress;
      // atribuindo ao endereço inicial do arquivo como endereço inicial da sequência livre
      for (
        let i = position.startAdress;
        i <= position.startAdress + file.offsetSize - 1;
        i++
      ) {
        // percorrendo o disco do endereço inicial da sequência livre até o tamanho do arquivo
        this.state.disk[i] = file; // guardando o arquivo no disco
      }
      console.log("Arquivo criado com sucesso!");
    } else {
      console.log("Espaço de memória insuficiente :(");
    }

    console.log("\n===============================================\n");
  }

  worstFit(file) {
    const bigger = this.spacesFree(); // array de sequência de blocos livres
    bigger.sort(function(a, b) {
      return b.offsetSize - a.offsetSize;
    }); // ordernando array de forma decrescente
    let position = null;
    for (let i = 0; i < bigger.length; i++) {
      // percorrendo array de sequência de blocos livres
      if (bigger[i].offsetSize >= file.offsetSize) {
        // verificando se o tamanho do deslocamento da sequência é compatível com o tamanho do deslocamento do arquivo
        position = bigger[i]; // guardando a sequência
        break;
      }
    }
    if (position !== null) {
      // verificando se a sequência é valida
      file.startAdress = position.startAdress;
      // atribuindo ao endereço inicial do arquivo como endereço inicial da sequência livre
      for (
        let i = position.startAdress;
        i <= position.startAdress + file.offsetSize - 1;
        i++
      ) {
        // percorrendo o disco do endereço inicial da sequência livre até o tamanho do arquivo
        this.state.disk[i] = file; // guardando o arquivo no disco
      }
      console.log("Arquivo criado com sucesso!");
    } else {
      console.log("Espaço de memória insuficiente :(");
    }

    console.log("\n===============================================\n");
  }

  spacesFree() {
    const { diskSize, disk } = this.state; // disco e tamanho do arquivo
    let count = 0;
    let startAdress = -1;
    const spacesFree = new Array(); // definindo array de blocos livres
    for (let i = 0; i < diskSize; i++) {
      // percorrendo o disco
      if (disk[i] === null) {
        // verificando se o bloco está livre
        count++; // incrementando quantidade de blocos livres da sequência
        if (count === 1) {
          // verificando se é o primeiro bloco livre da sequência
          startAdress = i; // guardando o indice do primeiro bloco livre
        }
        if (i + 1 === diskSize) {
          // verificando se o indíce atual é o último do disco
          let position = { startAdress, offsetSize: count }; // guardando o tamanho do deslocamento e o endereço inicial
          spacesFree.push(position); // adicionando o objeto ao array de espaços livres
        }
      } else {
        // caso o bloco esteja ocupado
        if (count > 0) {
          // verificando se a quantidade de blocos livres da última sequência é maior que 0
          let position = { startAdress, offsetSize: count }; // guardando o tamanho do deslocamento e o endereço inicial
          spacesFree.push(position); // adicionando o objeto ao array de espaços livres
        }
        count = 0; // definindo quantidade de blocos livres como 0
      }
    }
    return spacesFree;
  }

  validId(id) {
    const { disk, diskSize } = this.state; // disco e tamanho do disco
    for (let i = 0; i < diskSize; i++) {
      // percorrendo o disco
      if (disk[i] !== null && disk[i].id === id) {
        // verificando se o bloco está ocupado e se o identificador é igual ao identificador parâmetro
        console.log("Arquivo já existente!\n");
        return false;
      }
    }
    return true;
  }

  validOffsetSize(offsetSize) {
    const { diskSize } = this.state; // disco e tamanho do disco
    if (offsetSize > diskSize) {
      // verificando se o tamanho passado pelo parâmetro é maior que o tamanho do disco
      console.log(
        "Tamanho do deslocamento excede o tamanho definido para o disco!\n"
      );
      return false;
    } else if (offsetSize <= 0) {
      // verificando se o tamanho passado pelo parâmetro é menor ou igual a zero
      console.log("Tamanho do deslocamento deve ser maior que 0!\n");
      return false;
    }
    return true;
  }

  ask(question) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    }); // definindo a leitura de dados
    return new Promise(resolve => {
      // retornando uma Promise (processamento assíncrono)
      rl.question(question, answer => {
        // função responsável por exibir primeiro argumento e retornar uma função callback para leitura de dados do teclado
        resolve(answer); // resposta da Promise
        rl.close(); // encerrando leitura de dados
      });
    });
  }
}

new App();
