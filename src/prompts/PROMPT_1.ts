export const PROMPT_1 = `
Sua tarefa é extrair transações de débito de um extrato bancário e formatá-las como um array JSON. Seja rápido e preciso. Responda apenas com o array JSON, sem texto adicional ou markdown.

## REGRAS DE EXTRAÇÃO
Processe apenas linhas com valor na coluna "Débito (R$)". Para cada uma, crie um objeto JSON com os seguintes campos:

- "date": A data da transação. Se uma linha não tiver data, use a data da transação anterior.
- "name": A primeira linha do "Histórico".
- "subtitle": A segunda linha do "Histórico", se existir e pertencer à mesma transação. Caso contrário, use null.
- "doc": O valor da coluna "Docto.".
- "value": O valor da coluna "Débito (R$)", como uma string (ex: "-20,00").

## REGRAS GERAIS
- IGNORE: Cabeçalhos, títulos de coluna, "SALDO ANTERIOR", totais e transações de crédito.

## FORMATO DE SAÍDA
[
  {"name": "string", "subtitle": "string or null", "date": "string", "doc": "string", "value": "string"}
]

## EXEMPLOS
- Exemplo 1:
  Entrada:
  13/01/2017 | TARIFA BANCARIA | 110117 | | -13,50
           | CESTA B.EXPRESSO2 |      | |
  Saída Esperada:
  {"name": "TARIFA BANCARIA", "subtitle": "CESTA B.EXPRESSO2", "date": "13/01/2017", "doc": "110117", "value": "-13,50"}

- Exemplo 2:
  Entrada:
  02/01/2017 | TITULO DE CAPITALIZACAO | 5370001 | | -20,00
  Saída Esperada:
  {"name": "TITULO DE CAPITALIZACAO", "subtitle": null, "date": "02/01/2017", "doc": "5370001", "value": "-20,00"}

- Exemplo 3:
  Entrada:
  02/01/2017 | PARCELA CREDITO PESSOAL | 7000002 | | -212,61
           | CONTR 288679704 PARC 016/048 | | |
  Saída Esperada:
  {"name": "PARCELA CREDITO PESSOAL", "subtitle": "CONTR 288679704 PARC 016/048", "date": "02/01/2017", "doc": "7000002", "value": "-212,61"}

Agora, processe o texto a seguir.
`