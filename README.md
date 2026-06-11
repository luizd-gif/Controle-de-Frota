# Controle de Frota

Projeto organizado para subir no GitHub/Vercel.

## Estrutura principal

```txt
Controle-de-Frota/
├── index.html
├── assets/
│   ├── css/        # Estilos separados do index
│   ├── js/         # Scripts separados do index
│   ├── img/        # Imagens/ícones copiados para organização
│   └── data/       # Reservado para dados estáticos, se precisar
├── supabase/
│   └── sql/        # Scripts SQL do Supabase, quando existirem
├── docs/           # Documentação e manifesto da organização
├── backup/
│   └── original/   # Backup do ZIP e do index antes da organização
└── README.md
```

## Como subir no GitHub

1. Extraia o ZIP organizado.
2. Suba todos os arquivos para o repositório.
3. No Vercel, publique como projeto estático.
4. O arquivo principal continua sendo `index.html`.

## Supabase / SQL

O SQL não roda no Vercel. Ele deve ser executado no painel do Supabase.

- Se seu banco já está funcionando, não precisa rodar SQL para o site abrir.
- Scripts `.sql`, quando encontrados, foram copiados para `supabase/sql/`.
- O backup do projeto recebido está em `backup/original/`.

## O que foi feito nesta organização

- Mantive o projeto funcional como site estático.
- Extraí estilos `<style>` do `index.html` para `assets/css/`.
- Extraí scripts `<script>` internos do `index.html` para `assets/js/`.
- Mantive scripts externos por CDN no HTML.
- Preservei a ordem dos CSS/JS para reduzir risco de quebrar funções.
- Não alterei regras do Supabase, SQL ou estrutura do banco.

## Próximo passo recomendado

Esta organização é segura, mas ainda não é uma refatoração completa.

Depois de testar no Vercel, o ideal é juntar os scripts por módulo:

```txt
assets/js/utils.js
assets/js/services/supabase.js
assets/js/components/modal.js
assets/js/modules/veiculos.js
assets/js/modules/historico-veiculos.js
assets/js/modules/manutencoes.js
assets/js/modules/multas.js
assets/js/modules/producao.js
assets/js/modules/pontos.js
assets/js/modules/brat.js
```

Isso deve ser feito aos poucos, testando cada módulo.


## Versão leve para GitHub

Esta versão removeu backups pesados e arquivos `.zip` internos para ficar abaixo do limite de upload do GitHub.

Para funcionar no Vercel, o importante é manter:

```txt
index.html
assets/
supabase/
docs/
README.md
```

Não suba ZIPs grandes nem backups pesados para o GitHub.


## Atenção sobre arquivos grandes

Esta é a versão recomendada para subir no GitHub/Vercel.

Ela removeu PDFs e backups pesados para evitar o erro:

`Yowza, that’s a big file. Try again with a file smaller than 25MB.`

O sistema deve funcionar como front-end normalmente. Os PDFs antigos devem ser guardados fora do repositório ou enviados para um storage.


## Organização dos nomes dos arquivos

Os arquivos em `assets/css/` e `assets/js/` foram renomeados para nomes profissionais e organizados por ordem de carregamento.

Exemplos:

```txt
assets/css/01-base.css
assets/css/02-layout.css
assets/css/14-dark-mode.css
assets/js/01-configuracao.js
assets/js/20-veiculos.js
assets/js/21-historico-veiculos.js
assets/js/24-manutencoes.js
```

As referências no `index.html` foram atualizadas automaticamente.


## Versão bundle com poucos arquivos

Esta versão foi criada para evitar o erro do GitHub:

`Yowza, that’s a lot of files. Try uploading fewer than 100 at a time.`

Todos os arquivos CSS foram unidos em:

```txt
assets/css/style.css
```

Todos os arquivos JavaScript foram unidos em:

```txt
assets/js/app.js
```

O `index.html` já foi atualizado para usar esses dois arquivos.
