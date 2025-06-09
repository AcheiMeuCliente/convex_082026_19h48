# Blank Project with README
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
  
This project is connected to the Convex deployment named [`amicable-lobster-244`](https://dashboard.convex.dev/d/amicable-lobster-244).
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.

## Importação de Dados em Massa (CSV)

O sistema permite importar grandes volumes de empresas via arquivo CSV. Siga o fluxo:

1. Baixe o template CSV pelo painel de importação.
2. Preencha os dados conforme as colunas obrigatórias: `cnpj,razao_social,estado,municipio,cnae_principal_codigo,cnae_principal_nome`.
3. Faça upload do arquivo pelo painel de administração.
4. O sistema faz parsing, validação e importa os dados em chunks de 100 registros.
5. Acompanhe o progresso e veja feedback de sucesso ou erro.

**Dicas:**
- Use UTF-8 como encoding do arquivo.
- Separe grandes volumes em múltiplos arquivos se necessário.
- O sistema ignora CNPJs já existentes.
- Para performance máxima, evite arquivos com mais de 10 mil linhas por upload.

## Painel de Administração e Importação Assíncrona

- Apenas usuários com `isAdmin: true` podem acessar o painel de administração e importar arquivos CSV em massa.
- O upload de arquivos CSV é feito para o storage do Convex.
- Após o upload, uma action backend processa o arquivo em chunks, validando se o usuário é admin antes de importar.
- O progresso e o resultado da importação são exibidos no painel admin.

**Fluxo:**
1. Usuário admin faz login e acessa o painel admin.
2. Faz upload do CSV (arquivo vai para o storage do Convex).
3. Backend valida permissão e processa o arquivo em lotes.
4. Feedback visual do progresso e resultado.

**Segurança:**
- Apenas administradores podem importar dados em massa.
- O backend valida a permissão antes de processar qualquer arquivo.

## Exportação dinâmica de tabelas (frontend)

O projeto possui um utilitário global para exportação de dados de qualquer tabela do frontend, garantindo:
- Exportação apenas das colunas visíveis na tabela
- Ignora campos extras e de auditoria
- Compatibilidade com Excel (UTF-8 BOM, separador ;)
- Suporte a formatação customizada (datas, moeda, booleanos, etc)

### Como usar

1. Importe o utilitário ou componente:
```ts
import { exportToCsv } from "src/lib/exportToCsv";
import { TableExportButton } from "src/components/TableExportButton";
```
2. Defina os headers (nomes das colunas visíveis) e os dados:
```ts
const headers = ["estado", "municipio", "empresas"];
const data = [{ estado: "SP", municipio: "São Paulo", empresas: 100 }];
```
3. (Opcional) Defina formatadores customizados:
```ts
const formatters = {
  empresas: (v) => v.toLocaleString("pt-BR"),
};
```
4. Use o componente pronto no seu JSX:
```tsx
<TableExportButton
  headers={headers}
  data={data}
  filename="regioes.csv"
  formatters={formatters}
/>
```

### Exemplo de formatação customizada
```ts
const formatters = {
  capital_social: (v) => typeof v === "number" ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "",
  idade_empresa: (v) => v ? `${v} anos` : "",
};
```

> **Dica:** Use sempre os headers conforme as colunas visíveis na tabela. O utilitário e o componente podem ser usados em qualquer tabela do projeto!
