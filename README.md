# CARDÁPIO DIGITAL — CASA DA CHAWARMA UMUARAMA

Aplicação mobile-first moderna, interativa e responsiva desenvolvida com base no cardápio original da Casa da Chawarma Umuarama e inspirada na identidade visual premium com detalhes em dourado, âmbar e fundo grafite escuro.

## 🚀 Como Executar

```bash
cd casa-da-chawarma-umuarama
npm install
npm run dev
```

Acesse em seu navegador móvel ou desktop em: `http://localhost:5174/`

Para gerar a versão de produção otimizada:
```bash
npm run build
```

---

## 📱 Telas Implementadas (Fidelidade à Referência Visual)

1. **Tela Inicial (Início)**:
   - Identidade visual refinada com logotipo e slogan *"Sabor que vem do Oriente"*.
   - Banner gastronômico em alta resolução com foto destacada.
   - Chamada direta: *"O verdadeiro sabor do Oriente, aqui na sua cidade!"*.
   - Botão de ação direta em verde: *"Fazer pedido pelo WhatsApp"*.
   - Atalhos visuais para as categorias principais e destaques da casa.

2. **Tela de Categorias (Cardápio)**:
   - Trilho horizontal deslizante com botões de categorias (*"Todos", "Chawarmas", "Lanches prensados", "Porções", "Bebidas", "Cervejas", "Sucos", "Drinks e Destilados"*).
   - Modo de visualização de cartões com contagem automática de itens disponíveis.
   - Barra de pesquisa instantânea para busca por nome ou ingredientes.

3. **Tela de Produtos**:
   - Listagem com miniaturas gastronômicas selecionadas.
   - Descrição e ingredientes fiéis ao PDF original.
   - Preços destacados em dourado.
   - Botão circular dourado `+` para abertura de detalhes e adição rápida.

4. **Modal de Detalhes do Produto**:
   - Foto ampliada em alta resolução.
   - Seleção de opções/tamanhos (ex: *Inteira / Meia* para porções; *Natural / Ao Leite* para sucos).
   - Adicionais documentados (ex: *Queijo (+ R$ 5,00)* e *Bacon (+ R$ 5,00)*).
   - Campo de observações personalizadas (ex: "sem cebola", "creme de alho à parte").
   - Seletor de quantidade `[-] 1 [+]`.
   - Botão de adição com cálculo dinâmico de valor total.

5. **Carrinho de Compras ("Meu carrinho")**:
   - Listagem completa dos itens selecionados com foto, variação e adicionais.
   - Ajuste de quantidades e botão de exclusão de itens.
   - Identificação do cliente (Nome) e observações gerais.
   - Cálculo automático de subtotal e total.
   - Botão verde de finalização direta pelo WhatsApp.

6. **Tela de Confirmação ("Pedido enviado!")**:
   - Selo circular dourado com ícone de confirmação.
   - Botão para acompanhar status diretamente pelo WhatsApp.
   - Botão para retorno rápido ao cardápio.
   - Mensagem de agradecimento: *"Obrigado pela preferência!"*.

7. **Painel Administrativo Completo (CMS)**:
   - Protegido por PIN de segurança (padrão: `1234`, alterável no painel).
   - Gerenciamento de Produtos: cadastrar novo, editar preço, descrição, foto, ativar/pausar e excluir.
   - Gerenciamento de Categorias: criar, renomear e organizar.
   - Configurações do Estabelecimento: número oficial do WhatsApp, endereço, horário de funcionamento, Instagram e alteração do PIN de segurança.
   - **Auditoria de Fotos**: identificação de todos os itens com imagens ilustrativas aguardando envio de foto real pelo restaurante.
   - **Restauração de Segurança (1-clique)**: botão que restaura instantaneamente todas as 64 receitas, preços e descrições do PDF original.

---

## 📊 Estrutura de Dados Extraída do PDF Original

- **Chawarmas (8 produtos)**: Chawarma de Carne, Chawarma de Frango, Chawarma Misto, Chawarma de Carne - EXTRA, Chawarma de Frango - EXTRA, Chawarma Misto - EXTRA, Chawarma Vegetariano 1, Chawarma Vegetariano 2. Adicionais: Queijo ou Bacon (R$ 5,00).
- **Lanches Prensados (13 produtos)**: X-Burger, X-Salada, X-Bacon, X-Calabresa, X-Frango, X-Frango com Catupiry, X-Frango com Cheddar, X-Egg, X-Alcatra, X-Bacon Egg, X-Calabresa Egg, X-Frango Egg, X-Alcatra Egg.
- **Porções (13 produtos)**: Filé de Tilápia, Frango frito, Calabresa, Beirute, Batata frita, Batata frita c/ queijo, Batata frita c/ bacon, Batata frita c/ queijo e bacon, Polenta frita, Polenta frita c/ queijo, Polenta frita c/ bacon, Polenta frita c/ queijo e bacon, Salada mista.
- **Bebidas (12 produtos)**: Água com ou sem gás, Água Tônica, Citrus, Água Saborizada, Suco Del Valle, Suco Laranja Integral 300ml, Suco Laranja Integral 900ml, Refrigerante Lata, Refrigerante 600ml, Refrigerante 1l, Refrigerante 2l, Copo com Gelo e Limão.
- **Cervejas (4 produtos)**: Cerveja Garrafa (a partir de R$ 12,00), Litrão (R$ 13,00), Cerveja Long Neck (R$ 10,00), Cerveja Lata (a partir de R$ 6,00).
- **Sucos (7 opções com 2 bases)**: Abacaxi, Acerola, Abacaxi com Hortelã, Acerola com Laranja, Açaí, Laranja, Morango (Natural R$ 13,00 / Ao Leite R$ 15,00).
- **Drinks e Destilados (7 produtos)**: Batidinha de vinho, Caipirinha de vodka, Caipirinha de cerveja, Amarula, Whisky Red Label, Vinho Nacional, Campari.

**Total**: 64 itens oficiais e parametrizados.
