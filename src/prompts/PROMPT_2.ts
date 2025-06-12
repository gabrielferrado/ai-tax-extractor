export const PROMPT_2 = `
Sua tarefa é converter as linhas de uma tabela de extrato bancário em um array JSON. Aja como uma ferramenta de conversão de dados, focando em velocidade e precisão. Responda apenas com o array JSON, sem texto adicional ou markdown.

## REGRAS DE CONVERSÃO

1.  **FILTRAR LINHAS:** Processe APENAS as linhas que possuem um valor na coluna "Débito (R$)". Ignore todas as outras, incluindo as de crédito.

2.  **MAPEAMENTO DE COLUNAS:** Para cada linha de débito processada, sem formatação adicionar, mapeie os dados para um objeto JSON da seguinte forma:
    - "date": A data da transação. Se uma linha não tiver data, use a data da transação anterior
    - "name": A primeira linha do "Histórico"
    - "subtitle": A segunda linha do "Histórico", se existir e pertencer à mesma transação. Caso contrário, use null
    - "doc": O valor da coluna "Docto."
    - "value": O valor da coluna "Débito (R$)"

3.  **IGNORAR LIXO:** Ignore completamente cabeçalhos de página, títulos de coluna, e linhas contendo "SALDO ANTERIOR" ou "Total".

## FORMATO DE SAÍDA FINAL
[
  {"name": "string", "subtitle": "string or null", "date": "string", "doc": "string", "value": "string"}
]

Agora, converta o arquivo a seguir.
`