/**
 * EcoCycle - Educational Awareness & Interactive EcoQuiz Module
 * Provides curated articles on urban mining, hazardous materials, and an interactive quiz.
 */

const LearningModule = {
  currentQuestionIndex: 0,
  score: 0,
  userAnswers: [],
  quizCompleted: false,

  init() {
    this.renderArticles();
    this.initQuiz();
    this.bindEvents();
  },

  bindEvents() {
    const restartBtn = document.getElementById("quizRestartBtn");
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        this.resetQuiz();
      });
    }
  },

  renderArticles() {
    const container = document.getElementById("learningArticlesGrid");
    if (!container) return;

    container.innerHTML = SEED_DATA.articles.map(art => `
      <div class="article-card p-6 rounded-2xl border border-stone-200 bg-white hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ${art.category}
            </span>
            <span class="text-xs text-stone-400 font-medium">
              <i class="far fa-clock mr-1"></i>${art.readTime}
            </span>
          </div>

          <h3 class="font-bold text-stone-900 text-base mb-2 leading-snug">${art.title}</h3>
          <p class="text-xs text-stone-600 mb-4 line-clamp-3 leading-relaxed">${art.summary}</p>
        </div>

        <div>
          <button onclick="LearningModule.openArticleModal('${art.id}')" 
                  class="w-full py-2 rounded-xl border border-stone-300 hover:border-emerald-600 hover:bg-emerald-50 text-stone-800 hover:text-emerald-700 text-xs font-bold transition-all">
            Read Full Guide & Safety Protocol <i class="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    `).join("");
  },

  openArticleModal(artId) {
    const art = SEED_DATA.articles.find(a => a.id === artId);
    if (!art) return;

    const modalContent = document.getElementById("articleModalContent");
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="space-y-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ${art.category}
            </span>
            <span class="text-xs text-stone-400"><i class="far fa-clock mr-1"></i>${art.readTime}</span>
          </div>
          <h2 class="text-xl font-black text-stone-900">${art.title}</h2>
        </div>

        <div class="prose text-xs text-stone-700 space-y-3 leading-relaxed whitespace-pre-line bg-stone-50 p-4 rounded-xl border border-stone-200">
          ${art.content}
        </div>

        <div class="pt-2 flex justify-end">
          <button onclick="App.closeModal('articleModal')" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">
            Got it, thanks!
          </button>
        </div>
      </div>
    `;

    App.openModal("articleModal");
  },

  // Interactive Quiz System
  initQuiz() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.userAnswers = [];
    this.quizCompleted = false;
    this.renderQuestion();
  },

  renderQuestion() {
    const quizCard = document.getElementById("quizActiveContainer");
    const quizResultCard = document.getElementById("quizResultContainer");
    if (!quizCard) return;

    if (this.quizCompleted) {
      if (quizCard) quizCard.style.display = "none";
      if (quizResultCard) quizResultCard.style.display = "block";
      this.renderQuizResults();
      return;
    }

    if (quizCard) quizCard.style.display = "block";
    if (quizResultCard) quizResultCard.style.display = "none";

    const q = SEED_DATA.quizQuestions[this.currentQuestionIndex];
    const totalQ = SEED_DATA.quizQuestions.length;

    quizCard.innerHTML = `
      <div class="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
        <div class="flex items-center justify-between text-xs font-semibold text-stone-500 mb-4 pb-3 border-b border-stone-100">
          <span>Question ${this.currentQuestionIndex + 1} of ${totalQ}</span>
          <span class="text-emerald-600 font-bold">Current Score: ${this.score} pts</span>
        </div>

        <h3 class="text-base font-bold text-stone-900 mb-6 leading-relaxed">
          ${q.question}
        </h3>

        <div class="space-y-3 mb-6" id="quizOptionsContainer">
          ${q.options.map((opt, idx) => `
            <button onclick="LearningModule.handleAnswer(${idx})" 
                    class="quiz-option-btn w-full text-left p-3.5 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-xs text-stone-800 font-medium transition-all flex items-center justify-between">
              <span>${opt}</span>
              <span class="w-6 h-6 rounded-full border border-stone-300 text-stone-400 text-xs flex items-center justify-center font-bold">
                ${String.fromCharCode(65 + idx)}
              </span>
            </button>
          `).join("")}
        </div>

        <div id="quizFeedbackBox" class="hidden p-3 rounded-xl text-xs mb-4"></div>

        <div class="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
          <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" style="width: ${((this.currentQuestionIndex + 1) / totalQ) * 100}%"></div>
        </div>
      </div>
    `;
  },

  handleAnswer(selectedIdx) {
    const q = SEED_DATA.quizQuestions[this.currentQuestionIndex];
    const isCorrect = selectedIdx === q.correct;

    if (isCorrect) {
      this.score += 20;
    }

    const feedbackBox = document.getElementById("quizFeedbackBox");
    const optionBtns = document.querySelectorAll(".quiz-option-btn");

    optionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) {
        btn.classList.add("bg-emerald-100", "border-emerald-500", "text-emerald-900", "font-bold");
      } else if (idx === selectedIdx && !isCorrect) {
        btn.classList.add("bg-rose-100", "border-rose-500", "text-rose-900");
      }
    });

    if (feedbackBox) {
      feedbackBox.classList.remove("hidden");
      feedbackBox.className = `p-3 rounded-xl text-xs mb-4 border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`;
      feedbackBox.innerHTML = `
        <div class="flex items-start gap-2">
          <i class="fas ${isCorrect ? 'fa-check-circle text-emerald-600' : 'fa-times-circle text-rose-600'} mt-0.5"></i>
          <div>
            <strong>${isCorrect ? 'Correct Answer!' : 'Incorrect.'}</strong>
            <p class="mt-0.5 text-[11px]">${q.explanation}</p>
          </div>
        </div>
      `;
    }

    setTimeout(() => {
      if (this.currentQuestionIndex < SEED_DATA.quizQuestions.length - 1) {
        this.currentQuestionIndex++;
        this.renderQuestion();
      } else {
        this.quizCompleted = true;
        this.renderQuestion();
      }
    }, 1800);
  },

  renderQuizResults() {
    const resultContainer = document.getElementById("quizResultContainer");
    if (!resultContainer) return;

    const maxScore = SEED_DATA.quizQuestions.length * 20; // 100 pts
    const passed = this.score >= 60;

    if (passed) {
      // Award EcoPoints
      StorageManager.addPointsToCurrentUser(100, "EcoQuiz Mastery Award");
    }

    resultContainer.innerHTML = `
      <div class="p-8 bg-white rounded-2xl border border-stone-200 shadow-sm text-center">
        <div class="w-16 h-16 rounded-full ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'} flex items-center justify-center text-3xl mx-auto mb-4">
          <i class="fas ${passed ? 'fa-trophy' : 'fa-redo'}"></i>
        </div>

        <h3 class="text-xl font-bold text-stone-900 mb-1">
          ${passed ? 'Congratulations, Eco Scholar!' : 'Good Effort! Try Again for Points'}
        </h3>
        <p class="text-xs text-stone-500 mb-6">
          You scored <strong class="text-stone-900 font-bold">${this.score} / ${maxScore} points</strong>
        </p>

        ${passed ? `
          <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 max-w-sm mx-auto mb-6">
            <span class="text-xs font-bold text-emerald-800 uppercase block mb-1">Badge Unlocked: Circular Economy Specialist</span>
            <p class="text-xs text-emerald-700">+100 EcoPoints have been deposited into your wallet!</p>
          </div>
        ` : `
          <p class="text-xs text-stone-600 max-w-sm mx-auto mb-6">
            Review the environmental guides above to score 60% or higher and claim your +100 EcoPoints certificate!
          </p>
        `}

        <button onclick="LearningModule.initQuiz()" class="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all">
          <i class="fas fa-redo mr-1.5"></i> Retake EcoQuiz
        </button>
      </div>
    `;
  },

  resetQuiz() {
    this.initQuiz();
  }
};

if (typeof window !== "undefined") {
  window.LearningModule = LearningModule;
}
