# Streaming de áudio

## Como executar
  - Cliente: Abrir o arquivo index.html no browser (de preferencia o Chrome)
  - Servidor:
    1. Usar o node v18.12.1
    2. Instalar as dependências `npm install`
    3. Executar a aplicação `npm run start` ou `node index.js`
    
## Requisitos funcionais da Aplicação

1. Cliente deve poder recuperar a lista de músicas no servidor

2. Cliente deve poder clicar para tocar uma música hospedada no servidor

3. Se o cliente tentar tocar a música e ela não estiver em cache local, buscar no servidor

4. O servidor deve transmitir a música em blocos de 30 segundos de áudio

5. O cliente deve poder pausar a música, o que deve interromper a bufferização

6. Se o cliente retomar a execução do ponto parado ou reiniciar a música, o buffer local deve ser consumido

7. Diferentes clientes devem ser capazes de se descobrir em uma rede local

8. Clientes devem ser capazes de tocar a música em um cliente remoto