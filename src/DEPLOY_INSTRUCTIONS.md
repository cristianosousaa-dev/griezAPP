# 🚀 Como Fazer Deploy no Vercel

## Método 1: Via GitHub (Recomendado - Mais Fácil)

### Passo 1: Criar repositório no GitHub
1. Vai a https://github.com/new
2. Dá um nome ao repositório (ex: "freelancer-manager")
3. Deixa como público ou privado (à tua escolha)
4. Clica em "Create repository"

### Passo 2: Fazer upload do código
1. Descarrega todos os ficheiros deste projeto
2. No repositório GitHub que criaste, clica em "uploading an existing file"
3. Arrasta todos os ficheiros do projeto para a área de upload
4. Clica em "Commit changes"

### Passo 3: Deploy no Vercel
1. Vai a https://vercel.com
2. Clica em "Sign Up" e escolhe "Continue with GitHub"
3. Autoriza o Vercel a aceder ao GitHub
4. Clica em "New Project"
5. Importa o repositório "freelancer-manager"
6. O Vercel vai detetar automaticamente que é um projeto Vite
7. Clica em "Deploy"
8. Aguarda 2-3 minutos ⏳
9. 🎉 Pronto! Recebes um link tipo: https://freelancer-manager.vercel.app

---

## Método 2: Via Vercel CLI (Mais Rápido)

### Passo 1: Instalar Vercel CLI
```bash
npm i -g vercel
```

### Passo 2: Fazer Login
```bash
vercel login
```

### Passo 3: Deploy
```bash
vercel
```

Segue as instruções no terminal e pronto!

---

## Método 3: Drag & Drop (Mais Simples de Todos)

1. Vai a https://vercel.com
2. Faz sign up/login
3. Clica em "Add New" → "Project"
4. Arrasta a pasta do projeto para a área de upload
5. Clica em "Deploy"
6. Pronto! 🎉

---

## 🔗 Partilhar com o teu amigo

Depois do deploy, vais receber um link tipo:
- https://freelancer-manager.vercel.app
- https://seu-projeto-abc123.vercel.app

**Copia esse link e envia ao teu amigo!** 📱

Ele pode abrir diretamente no navegador móvel ou desktop.

---

## 💡 Dicas

- ✅ O deploy é **gratuito**
- ✅ Atualizações são **automáticas** (se usares GitHub)
- ✅ O link é **permanente**
- ✅ Funciona perfeitamente em **mobile**
- ✅ HTTPS automático (seguro)

---

## ⚠️ Nota sobre os dados

Como a app usa localStorage, os dados são guardados apenas no dispositivo do utilizador. Cada pessoa que aceder terá os seus próprios dados.

Se quiseres dados partilhados entre utilizadores, precisarias de backend (Supabase, Firebase, etc.).

---

## 🆘 Problemas?

Se tiveres algum erro:
1. Verifica se todos os ficheiros foram carregados
2. Verifica os logs de build no Vercel
3. Tenta fazer deploy novamente

Boa sorte! 🚀
