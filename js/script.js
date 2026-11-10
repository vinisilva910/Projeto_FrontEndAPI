// Endereço da API pública utilizada no projeto
const API_URL = "https://rickandmortyapi.com/api/character";

// Elementos da página que serão atualizados pelo JavaScript
const lista = document.getElementById("lista-personagens");
const mensagem = document.getElementById("mensagem");
const busca = document.getElementById("busca");
const filtroStatus = document.getElementById("filtro-status");
const filtroEspecie = document.getElementById("filtro-especie");
const totalPersonagens = document.getElementById("total-personagens");
const totalExibidos = document.getElementById("total-exibidos");
const paginaAtual = document.getElementById("pagina-atual");
const botaoAnterior = document.getElementById("anterior");
const botaoProxima = document.getElementById("proxima");

let pagina = 1;
let ultimaPagina = 1;
let personagens = [];

// Faz a requisição HTTP e transforma a resposta em objeto JavaScript.
async function carregarPersonagens(numeroPagina = 1) {
  mensagem.textContent = "Carregando registros do multiverso...";
  lista.innerHTML = "";
  botaoAnterior.disabled = true;
  botaoProxima.disabled = true;

  try {
    const resposta = await fetch(`${API_URL}?page=${numeroPagina}`);

    if (!resposta.ok) {
      throw new Error("Não foi possível acessar a API.");
    }

    const dados = await resposta.json();
    personagens = dados.results;
    pagina = numeroPagina;
    ultimaPagina = dados.info.pages;

    totalPersonagens.textContent = dados.info.count.toLocaleString("pt-BR");
    paginaAtual.textContent = `Página ${pagina} de ${ultimaPagina}`;
    botaoAnterior.disabled = pagina === 1;
    botaoProxima.disabled = pagina === ultimaPagina;

    aplicarFiltros();
  } catch (erro) {
    mensagem.textContent = "Erro ao carregar os personagens. Verifique sua conexão e tente novamente.";
    console.error("Erro na consulta da API:", erro);
  }
}

// Cria os elementos HTML de cada card sem deixar cards fixos no HTML inicial.
function criarCard(personagem) {
  const card = document.createElement("article");
  card.classList.add("card-personagem");

  const imagem = document.createElement("img");
  imagem.src = personagem.image;
  imagem.alt = `Imagem de ${personagem.name}`;
  imagem.loading = "lazy";

  const dados = document.createElement("div");
  dados.classList.add("card-dados");

  const nome = document.createElement("h3");
  nome.textContent = personagem.name;

  const status = document.createElement("p");
  const statusTexto = {
    Alive: "Vivo",
    Dead: "Morto",
    unknown: "Desconhecido"
  };
  status.textContent = `Status: ${statusTexto[personagem.status] || personagem.status}`;
  status.classList.add("status");
  if (personagem.status === "Alive") status.classList.add("vivo");
  if (personagem.status === "Dead") status.classList.add("morto");

  const especie = document.createElement("p");
  especie.textContent = `Espécie: ${personagem.species}`;

  const origem = document.createElement("p");
  origem.textContent = `Origem: ${personagem.origin.name}`;

  dados.append(nome, status, especie, origem);
  card.append(imagem, dados);

  return card;
}

// Filtra os resultados da página atual e monta novamente a área de cards.
function aplicarFiltros() {
  const termo = busca.value.trim().toLowerCase();
  const statusEscolhido = filtroStatus.value;
  const especieEscolhida = filtroEspecie.value;

  const filtrados = personagens.filter((personagem) => {
    const combinaNome = personagem.name.toLowerCase().includes(termo);
    const combinaStatus = !statusEscolhido || personagem.status === statusEscolhido;
    const combinaEspecie = !especieEscolhida ||
      (especieEscolhida === "Alien"
        ? personagem.species.toLowerCase() !== "human"
        : personagem.species.toLowerCase() === especieEscolhida.toLowerCase());

    return combinaNome && combinaStatus && combinaEspecie;
  });

  lista.innerHTML = "";

  if (filtrados.length === 0) {
    lista.innerHTML = '<p class="vazio">Nenhum personagem encontrado nesta página com esses filtros.</p>';
  } else {
    filtrados.forEach((personagem) => {
      const card = criarCard(personagem);
      lista.appendChild(card);
    });
  }

  totalExibidos.textContent = filtrados.length;
  mensagem.textContent = `Mostrando ${filtrados.length} personagem(ns) nesta página.`;
}

// Eventos dos campos de pesquisa e filtros.
busca.addEventListener("input", aplicarFiltros);
filtroStatus.addEventListener("change", aplicarFiltros);
filtroEspecie.addEventListener("change", aplicarFiltros);

botaoAnterior.addEventListener("click", () => {
  if (pagina > 1) carregarPersonagens(pagina - 1);
});

botaoProxima.addEventListener("click", () => {
  if (pagina < ultimaPagina) carregarPersonagens(pagina + 1);
});

// Primeira consulta ao abrir o site.
carregarPersonagens();
