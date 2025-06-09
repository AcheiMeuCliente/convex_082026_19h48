# Guia de Importação e Backup de Dados

Este guia fornece instruções detalhadas para importação, exportação e backup de dados no sistema.

## 📁 Estrutura de Pastas

```
data/
├── template.csv          # Template base para importação
├── sample/              # Exemplos de arquivos CSV
│   └── empresas_exemplo.csv
├── backup/              # Backups (não versionado)
└── README.md           # Este arquivo
```

## 🚀 Guia Passo a Passo

### 1. Preparando seu Arquivo CSV

1. **Use o Template Base**
   ```bash
   # Copie o template
   cp template.csv meu_arquivo.csv
   ```

2. **Preencha os Campos Obrigatórios**
   ```csv
   cnpj,razao_social,cnae_principal_codigo,cnae_principal_nome,municipio,estado,mei,simples
   27083149000138,EMPRESA EXEMPLO LTDA,4751201,COMÉRCIO VAREJISTA,SAO PAULO,SP,true,true
   ```

3. **Formate os Dados Corretamente**
   - Datas: `YYYY-MM-DD` (ex: `2024-03-15`)
   - Booleanos: `true` ou `false`
   - CNPJ: apenas números
   - Capital social: número sem formatação

### 2. Importando Dados

1. **Importação Básica**
   ```bash
   # Importar arquivo CSV
   npx convex import companies data/sample/empresas_exemplo.csv
   ```

2. **Importação com Validação**
   ```bash
   # Validar schema antes de importar
   npx convex import companies data/sample/empresas_exemplo.csv --validate-schema
   ```

3. **Importação com Atualização**
   ```bash
   # Atualizar registros existentes
   npx convex import companies data/sample/empresas_exemplo.csv --update
   ```

### 3. Backup e Restore

1. **Criar Backup**
   ```bash
   # Backup completo
   npx convex export --output data/backup/backup_$(date +%Y%m%d).zip
   
   # Backup apenas da tabela companies
   npx convex export companies --output data/backup/companies_$(date +%Y%m%d).zip
   ```

2. **Restaurar Backup**
   ```bash
   # Restaurar backup completo
   npx convex import --input data/backup/backup_20240315.zip
   
   # Restaurar apenas companies
   npx convex import companies --input data/backup/companies_20240315.zip
   ```

### 4. Exemplos Práticos

#### Exemplo 1: Importação de Novas Empresas
```bash
# 1. Preparar arquivo
cp template.csv novas_empresas.csv

# 2. Editar arquivo (usar Excel ou editor de texto)

# 3. Validar schema
npx convex import companies novas_empresas.csv --validate-schema

# 4. Importar dados
npx convex import companies novas_empresas.csv
```

#### Exemplo 2: Atualização em Massa
```bash
# 1. Exportar dados atuais
npx convex export companies --output data/backup/antes_atualizacao.zip

# 2. Preparar arquivo de atualização
cp template.csv atualizacoes.csv

# 3. Importar com modo de atualização
npx convex import companies atualizacoes.csv --update
```

#### Exemplo 3: Backup Diário Automatizado
```bash
# Criar script backup.sh
#!/bin/bash
DATA=$(date +%Y%m%d)
npx convex export --output data/backup/backup_$DATA.zip

# Agendar no cron
0 0 * * * /caminho/para/backup.sh
```

## ⚠️ Dicas Importantes

1. **Antes de Importar**
   - Faça backup dos dados atuais
   - Valide o schema do arquivo
   - Teste com um arquivo pequeno primeiro

2. **Durante a Importação**
   - Monitore o progresso
   - Verifique os logs de erro
   - Mantenha o terminal aberto

3. **Após a Importação**
   - Verifique a quantidade de registros
   - Confirme alguns registros manualmente
   - Mantenha o arquivo CSV para referência

## 🔍 Solução de Problemas

### Erro: Schema Inválido
```bash
# Verificar schema
npx convex import companies arquivo.csv --validate-schema

# Corrigir campos obrigatórios
- cnpj
- cnae_principal_codigo
- cnae_principal_nome
- razao_social
- municipio
- estado
- mei
- simples
```

### Erro: Formato de Data
```csv
# Incorreto
data_inicio_atividade
01/01/2024

# Correto
data_inicio_atividade
2024-01-01
```

### Erro: CNPJ Formatado
```csv
# Incorreto
cnpj
27.083.149/0001-38

# Correto
cnpj
27083149000138
```

## 📊 Exemplo de CSV Válido

```csv
cnpj,cnae_principal_codigo,cnae_principal_nome,razao_social,nome_fantasia,telefone_1,email,municipio,estado,mei,simples,capital_social,data_inicio_atividade
27083149000138,4751201,COMÉRCIO VAREJISTA,EMPRESA EXEMPLO LTDA,EXEMPLO,+5511999999999,contato@exemplo.com,SAO PAULO,SP,true,true,10000,2024-01-01
```

## 🔄 Fluxo de Trabalho Recomendado

1. **Desenvolvimento**
   - Use `data/sample/empresas_exemplo.csv` para testes
   - Valide alterações no schema
   - Teste importações pequenas

2. **Homologação**
   - Importe dados reais
   - Verifique integridade
   - Teste funcionalidades

3. **Produção**
   - Faça backup antes
   - Use modo de atualização
   - Monitore o processo
   - Verifique resultados

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do Convex
2. Consulte a documentação oficial
3. Verifique o schema no arquivo `convex/schema.ts`
4. Entre em contato com o suporte 

## Campos de Auditoria no Backend

O backend Convex possui dois campos extras opcionais na tabela `companies`:
- `importado_em`: timestamp (número) indicando quando o registro foi importado.
- `atualizado_em`: timestamp (número) indicando quando o registro foi atualizado pela última vez.

Esses campos **não existem no CSV oficial** e são usados apenas para controle, auditoria e rastreabilidade interna do sistema. Eles não afetam a importação/exportação do CSV.

## Exportando Dados para o CSV Oficial

Ao exportar dados para o formato CSV oficial, basta ignorar os campos `importado_em` e `atualizado_em`.

### Exemplo de exportação limpa (Node.js):

```js
// Supondo que você já tenha um array de empresas (companies) do Convex
const camposCsvOficial = [
  "CNPJ","CNAE_PRINCIPAL_CODIGO","CNAE_PRINCIPAL_NOME","CNAE_SECUNDARIO_CODIGO","CNAE_SECUNDARIO_NOME","RAZÃO SOCIAL","NOME FANTASIA","TELEFONE_1","TELEFONE_2","TELEFONE_3","E-MAIL","BAIRRO","CEP","MUNICIPIO","ESTADO","ENDERECO MAPA","MAPS","MATRIZ FILIAL","PORTE","CAPITAL SOCIAL","MEI","SIMPLES","INICIO ATIVIDADE","RECEITA FEDERAL","NATUREZA_JURIDICA","EMAIL_CONTABILIDADE","TEM_EMAIL","TEM_TELEFONE","WHATSAPP_1","WHATSAPP_2","WHATSAPP_3","DOMINIO_CORPORATIVO","SITE"
];

const csv = [camposCsvOficial.join(';')].concat(
  companies.map(c => camposCsvOficial.map(col => c[csvToSnakeCaseMap[col]] ?? '').join(';'))
).join('\n');
```

> **Dica:** Sempre que for exportar para o CSV oficial, gere o arquivo apenas com os campos do modelo, ignorando qualquer campo extra do backend. 