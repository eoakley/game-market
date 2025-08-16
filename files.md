# The Immortality Merchant - File Structure Documentation

Este documento explica o propósito e conteúdo de cada arquivo na estrutura modular do jogo.

## 📁 Estrutura de Arquivos

### 🎮 **index.html**
- **Propósito**: Arquivo principal HTML que contém a estrutura das telas do jogo
- **Conteúdo**: 
  - Telas do jogo (intro, loja, relatório diário, vitória)
  - Referências aos arquivos CSS e JavaScript modulares
  - Elementos de UI organizados semanticamente
- **Responsabilidade**: Interface visual e estrutura do DOM

### 🎨 **css/styles.css**
- **Propósito**: Estilos visuais e animações do jogo
- **Conteúdo**:
  - Estilos globais e layout
  - Animações (bounce, shake, pulse, coinFlip, fadeIn)
  - Estilos para cards de itens e efeitos hover
  - Classes para elementos da UI (timer, cash, botões)
  - Estilos para relatórios e popups
- **Responsabilidade**: Visual design e feedback visual

---

## 🧩 **Módulos JavaScript**

### 🏪 **js/gameState.js**
- **Propósito**: Gerenciamento centralizado do estado do jogo
- **Conteúdo**:
  - Estado central do jogo (dinheiro, dia, tier, inventário)
  - Getters/setters para todos os valores do estado
  - Métodos utilitários para modificação do estado
  - Cálculos derivados (renda passiva, custo diário)
- **Responsabilidade**: Single source of truth para dados do jogo
- **Preparado para**: Sistema de conquistas, progressão, dificuldade

### 📦 **js/itemSystem.js**
- **Propósito**: Sistema completo de itens e geração
- **Conteúdo**:
  - Templates de itens organizados por tier
  - Geração procedural de itens com qualidades aleatórias
  - Cálculo de valores visuais e de mercado
  - Sistema de ponderação para raridade de itens
  - Criação da Poção da Imortalidade
- **Responsabilidade**: Toda lógica relacionada a itens
- **Preparado para**: Novos tipos de itens, sistema de progressão, imagens

### 🛒 **js/shopManager.js**
- **Propósito**: Gerenciamento de lojas e compras
- **Conteúdo**:
  - Geração de lojas com 5 itens
  - Lógica de compra de itens
  - Sistema de lojas lendárias
  - Navegação entre lojas (next/skip)
  - Efeitos visuais de compra
- **Responsabilidade**: Interface entre jogador e sistema de itens
- **Preparado para**: Upgrades de compra instantânea, dicas de melhores negócios

### ⚡ **js/upgradeManager.js**
- **Propósito**: Sistema de upgrades e construções
- **Conteúdo**:
  - Gerenciamento de upgrades (Clocktower, Stables, Jeweler, Loss Revert)
  - Sistema de construções passivas (Bank, Mega Building)
  - Cálculo de custos e disponibilidade
  - Atualização da UI de upgrades
- **Responsabilidade**: Progressão e melhorias do jogador
- **Preparado para**: Novos upgrades, sistema de níveis, upgrades automáticos

### ⏰ **js/timerSystem.js**
- **Propósito**: Sistema de tempo e cronômetro
- **Conteúdo**:
  - Gerenciamento do timer diário
  - Efeitos visuais de warning
  - Cálculo de tempo máximo baseado em upgrades
  - Funcionalidades para adicionar tempo
- **Responsabilidade**: Controle temporal do jogo
- **Preparado para**: Power-ups de tempo, sistema de dificuldade

### 📊 **js/dayManager.js**
- **Propósito**: Gerenciamento de dias e relatórios
- **Conteúdo**:
  - Transição entre dias
  - Geração de relatórios de lucro
  - Aplicação de Loss Revert Magic
  - Animações de revelação de resultados
  - Cálculo de estatísticas diárias
- **Responsabilidade**: Ciclo de dias e análise de performance
- **Preparado para**: Estatísticas avançadas, sistema de conquistas

### 🖥️ **js/uiManager.js**
- **Propósito**: Gerenciamento de interface e transições
- **Conteúdo**:
  - Troca de telas
  - Atualização de elementos da UI
  - Animações de feedback (cash, notifications)
  - Event listeners centralizados
  - Sistema de modals e notificações
- **Responsabilidade**: Interface responsiva e feedback visual
- **Preparado para**: Tutoriais, tooltips, interfaces avançadas

### 🎯 **js/gameManager.js**
- **Propósito**: Coordenação geral e fluxo principal
- **Conteúdo**:
  - Inicialização do jogo
  - Orquestração de módulos
  - Sistema de save/load (preparado)
  - Verificação de vitória
  - Coleta de estatísticas
- **Responsabilidade**: High-level game flow e coordenação
- **Preparado para**: Sistema de conquistas, analytics, multiplayer

### 🔧 **js/utils.js**
- **Propósito**: Funções utilitárias reutilizáveis
- **Conteúdo**:
  - Formatação de números e moeda
  - Funções matemáticas (random, clamp, lerp)
  - Manipulação de arrays e objetos
  - Local storage helpers
  - Validações e formatações
- **Responsabilidade**: Ferramentas auxiliares para todo o código
- **Preparado para**: Funções específicas de novos features

---

## 🚀 **Preparação para Features Futuras**

### 💰 **Mais Upgrades**
- **Localização**: `upgradeManager.js` e `shopManager.js`
- **Implementação Ready**: Métodos `addUpgradeType()` e `addBuildingType()`
- **Para insta-buy**: Adicionar em `shopManager.js`
- **Para TIP button**: Integrar com `ItemSystem.calculateProfit()`

### 📈 **Sistema de Progressão**
- **Localização**: `itemSystem.js` e `gameState.js`
- **Implementação Ready**: Sistema de tracking de compras por item
- **Para mostrar valores base**: Modificar `_generateItemHTML()` em `shopManager.js`

### 🏆 **Sistema de Conquistas**
- **Localização**: `gameManager.js` possui placeholder
- **Implementação Ready**: `checkAchievements()` e coleta de estatísticas
- **Para tracking**: Usar `DayManager.getDayStats()` e `GameManager.getGameStats()`

### ⚙️ **Sistema de Dificuldade**
- **Localização**: `itemSystem.js` e `shopManager.js`
- **Implementação Ready**: Modificar `generateItem()` baseado no tier
- **Para margens menores**: Ajustar cálculo de `shopPrice` por tier

### 🖼️ **Gráficos Melhorados**
- **Localização**: `itemSystem.js` método `calculateItemVisuals()`
- **Implementação Ready**: Sistema de visual properties separado
- **Para imagens**: Modificar `_generateItemHTML()` para usar `<img>` em vez de `<i>`

---

## 🏗️ **Arquitetura Modular**

### ✅ **Vantagens da Nova Estrutura**
1. **Separação de Responsabilidades**: Cada módulo tem uma função específica
2. **Reutilização**: Funções podem ser usadas por diferentes módulos
3. **Manutenibilidade**: Fácil localizar e modificar funcionalidades
4. **Escalabilidade**: Simples adicionar novos features sem quebrar existentes
5. **Testabilidade**: Cada módulo pode ser testado independentemente

### 🔄 **Fluxo de Dados**
```
GameState ← → [ItemSystem, ShopManager, UpgradeManager, DayManager]
                           ↓
UIManager ← → TimerSystem ← → GameManager
                           ↑
                        Utils
```

### 📋 **Convenções de Código**
- **Namespace**: Cada módulo usa seu próprio namespace
- **Método Público**: Funções expostas para outros módulos
- **Método Privado**: Funções internas marcadas com `_` (underscore)
- **Documentação**: JSDoc comments explicam propósito e parâmetros
- **Consistência**: Padrões uniformes de naming e estrutura

---

Esta estrutura modular está completamente preparada para suas expansões futuras, mantendo o código organizado e fácil de manter! 🎮✨
