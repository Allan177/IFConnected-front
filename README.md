 <div align="center">

# 🌐 IFConnected
### A Rede Social Acadêmica Geo-Localizada

![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-NoSQL-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

<p align="center">
  <a href="#-sobre">Sobre</a> •
  <a href="#-arquitetura-e-tecnologias">Arquitetura</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-como-rodar">Como Rodar</a> •
  <a href="#-api-endpoints">API</a>
</p>

</div>

---

## 📘 Sobre

**IFConnected** é uma plataforma de rede social desenvolvida para conectar estudantes de diferentes campi do Instituto Federal.

Diferente de redes sociais genéricas, o **IFConnected** utiliza inteligência geográfica (**PostGIS**) para conectar alunos que estudam no mesmo campus ou em unidades próximas, facilitando a organização de eventos acadêmicos e etc.

O projeto foi construído como um estudo avançado de **Arquitetura de Software**, implementando o conceito de **Persistência Poliglota**, onde diferentes bancos de dados resolvem problemas específicos de performance e escalabilidade.

---

## 🏗 Arquitetura e Tecnologias

O sistema opera em uma arquitetura de microsserviços simulada (monólito modular) orquestrada via Docker.

| Tecnologia | Função no Ecossistema |
| :--- | :--- |
| **Java Spring Boot 3** | API RESTful central, segurança e regras de negócio. |
| **Next.js 14 (App Router)** | Frontend moderno, responsivo e com Server Side Rendering. |
| **PostgreSQL + PostGIS** | Dados relacionais (Usuários, Relacionamentos) e **Cálculos Geográficos** (Raio de distância). |
| **MongoDB** | Dados volumosos e não estruturados (Feed de Posts, Comentários, Notificações). |
| **Redis** | Cache de alta performance para perfis de usuário e sessões. |
| **MinIO (S3)** | Armazenamento de objetos (Upload de imagens de perfil e posts). |
| **Docker Compose** | Orquestração de todo o ambiente de infraestrutura. |

### 🧠 Fluxo de Dados (Persistência Poliglota)

```mermaid
graph TD
    User((Usuário)) --> NextJS[Frontend Next.js]
    NextJS --> API[API Spring Boot]
    
    API -->|Auth & Relacionamentos| Postgres[(PostgreSQL + PostGIS)]
    API -->|Feed & Notificações| Mongo[(MongoDB)]
    API -->|Cache de Perfil| Redis[(Redis)]
    API -->|Upload de Imagens| MinIO[(MinIO S3)]
✨ Funcionalidades
🌍 Geolocalização e Conexões
Feed Regional: Posts de usuários dentro de um raio de 50km do seu campus.
Sugestões Inteligentes: "Pessoas que você talvez conheça" baseado na proximidade do campus.
Vínculo de Campus: Seleção de unidade baseada em coordenadas GPS reais.
📱 Social
Feed Híbrido: Abas para Feed Global, Seguindo e Regional.
Interações: Curtir, Comentar e Seguir/Deixar de Seguir.
Perfil Completo: Foto de perfil, biografia, contagem de seguidores e posts.
Notificações: Alertas em tempo real de interações (MongoDB).
📅 Acadêmico (Módulo JPA)
Gestão de Eventos: Criação e listagem de eventos por Campus.
Presença: Confirmação de participação em eventos.
🚀 Como Rodar
Pré-requisitos
Docker e Docker Compose instalados.
Java 21 (JDK).
Node.js 18+ (Para o frontend).
1. Subir a Infraestrutura (Docker)
Na raiz do projeto, inicie os bancos de dados:
code
Bash
docker-compose up -d
Isso iniciará: Postgres (5432), Mongo (27017), Redis (6379) e MinIO (9000/9001).
2. Executar o Backend (Spring Boot)
code
Bash
./mvnw spring-boot:run
O Backend rodará em http://localhost:8080. As tabelas e dados iniciais serão criados automaticamente pelo DataSeeder.
3. Executar o Frontend (Next.js)
Abra um novo terminal na pasta ifconnected-front:
code
Bash
cd ifconnected-front
npm install
npm run dev
Acesse a aplicação em http://localhost:3000.
🔌 API Endpoints
<details>
<summary>👀 Clique para expandir a lista de rotas principais</summary>
Autenticação & Usuários
POST /api/login - Autenticação.
POST /api/users - Criar conta.
GET /api/users/{id}/profile - Perfil completo (DTO Híbrido).
PUT /api/users/{id} - Editar perfil.
POST /api/users/{id}/photo - Upload de foto.
Social Graph
POST /api/users/{id}/follow/{target} - Seguir.
DELETE /api/users/{id}/follow/{target} - Deixar de seguir.
GET /api/users/{id}/suggestions - Sugestões por geolocalização.
Posts (Feed)
POST /api/posts - Criar postagem.
GET /api/posts/feed/regional - Feed geo-localizado.
GET /api/posts/feed/{userId} - Feed de seguidos.
POST /api/posts/{id}/like - Curtir.
POST /api/posts/{id}/comments - Comentar.
Eventos & Notificações
GET /api/events/campus/{id} - Listar eventos.
POST /api/events - Criar evento.
GET /api/notifications/user/{id} - Listar notificações.
</details>
🛠️ Design & UI
O Frontend foi construído focando em uma experiência Mobile-First e Minimalista, inspirada no Twitter/X.
Dark Mode nativo.
Componentes Reutilizáveis com TypeScript.
Tailwind CSS para estilização performática.
