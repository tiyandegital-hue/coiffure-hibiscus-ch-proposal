/* ============================================================
   Simulateur de conversation WhatsApp — Coiffure Hibiscus.
   Scénarios 100 % fictifs, à but de démonstration.
   Tous les prix affichés sont des EXEMPLES (voir DEMO_PRICE_NOTE).
   ============================================================ */
(function () {
  "use strict";

  var PRICE_NOTE = (window.DEMO_PRICE_NOTE ||
    "Prix d'exemple — à personnaliser avec vos vrais tarifs.");

  /* ---------- Scénarios ---------- */
  var SCENARIOS = {
    reservation: {
      title: "Nouvelle réservation",
      desc: "Une cliente réserve un balayage en 40 secondes, sans appeler.",
      steps: [
        { from: "bot", text: "Bonjour et bienvenue chez Coiffure Hibiscus ! Je suis Hibiscus, votre assistante. Que puis-je faire pour vous ?" },
        { from: "choice", options: ["Prendre rendez-vous", "Voir les prestations", "Parler au salon"] },
        { from: "bot", text: "Avec plaisir ! Pour quelle prestation souhaitez-vous réserver ?" },
        { from: "choice", options: ["Coupe femme", "Balayage", "Manucure"] },
        { from: "bot", text: "Très bon choix. Quel jour vous arrange le mieux ?" },
        { from: "choice", options: ["Samedi", "Mardi", "Jeudi"] },
        { from: "bot", text: "Samedi, il me reste 10h30 ou 14h00. Lequel préférez-vous ?" },
        { from: "choice", options: ["10h30", "14h00"] },
        { from: "bot", text: "Parfait. À quel nom dois-je enregistrer la réservation ?" },
        { from: "choice", options: ["Camille R."] },
        { from: "bot", text: "C'est noté, Camille ! Balayage — samedi à 10h30. Vous recevrez un rappel la veille. Autre chose ?" },
        { from: "choice", options: ["Non, merci !", "Prendre un autre rendez-vous"] },
        { from: "bot", text: "Avec grand plaisir, à samedi !", end: true }
      ]
    },
    deplacer: {
      title: "Déplacer un rendez-vous",
      desc: "Un imprévu ? Le client déplace son rendez-vous sans déranger le salon.",
      steps: [
        { from: "bot", text: "Bonjour ! Je suis Hibiscus, votre assistante. Que puis-je faire pour vous ?" },
        { from: "choice", options: ["Déplacer mon rendez-vous", "Annuler mon rendez-vous"] },
        { from: "bot", text: "Bien sûr. À quel nom est la réservation ?" },
        { from: "choice", options: ["Camille R."] },
        { from: "bot", text: "Je trouve : Balayage — samedi 10h30. Vers quel créneau souhaitez-vous le déplacer ?" },
        { from: "choice", options: ["Vendredi 16h00", "Lundi 11h00"] },
        { from: "bot", text: "C'est déplacé ! Nouveau rendez-vous : vendredi 16h00. Un rappel vous sera envoyé la veille.", end: true }
      ]
    },
    annulation: {
      title: "Annulation",
      desc: "Le créneau libéré redevient réservable — zéro appel manqué.",
      steps: [
        { from: "bot", text: "Bonjour ! Je suis Hibiscus, votre assistante. Que puis-je faire pour vous ?" },
        { from: "choice", options: ["Annuler mon rendez-vous", "Déplacer mon rendez-vous"] },
        { from: "bot", text: "Très bien. À quel nom est la réservation ?" },
        { from: "choice", options: ["Camille R."] },
        { from: "bot", text: "Votre rendez-vous : Balayage — samedi 10h30. Confirmez-vous l'annulation ?" },
        { from: "choice", options: ["Oui, annuler", "Non, le garder"] },
        { from: "bot", text: "C'est annulé. Le créneau est de nouveau disponible. À bientôt !", end: true }
      ]
    },
    tarifs: {
      title: "Question sur les tarifs",
      desc: "Le bot répond instantanément, même à 23h un dimanche.",
      steps: [
        { from: "bot", text: "Bonsoir ! Je suis Hibiscus, votre assistante — je réponds même quand le salon est fermé. Que cherchez-vous ?" },
        { from: "choice", options: ["Quels sont vos tarifs ?", "Prendre rendez-vous"] },
        { from: "bot", text: "Voici nos prestations les plus demandées (exemples) : coupe femme dès 65.–, balayage dès 140.–, manucure dès 45.–. " + PRICE_NOTE },
        { from: "choice", options: ["Réserver un balayage", "Merci, c'est tout"] },
        { from: "bot", text: "Avec plaisir ! Quel jour vous arrange ?", end: true }
      ]
    }
  };

  /* ---------- Moteur de rendu ---------- */
  function now() {
    var d = new Date();
    return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function ChatEngine(bodyEl, qrEl) {
    this.body = bodyEl;
    this.qr = qrEl;
    this.timer = null;
  }

  ChatEngine.prototype.clear = function () {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    this.body.innerHTML = "";
    this.qr.innerHTML = "";
    var date = el("div", "wa-date", "Aujourd'hui — démonstration");
    this.body.appendChild(date);
  };

  ChatEngine.prototype.addMsg = function (from, text, done) {
    var m = el("div", "msg " + (from === "bot" ? "in" : "out"), text);
    var t = el("time", null, now());
    m.appendChild(t);
    this.body.appendChild(m);
    this.body.scrollTop = this.body.scrollHeight;
    if (done) done();
  };

  ChatEngine.prototype.typing = function (done) {
    var m = el("div", "msg in typing");
    m.setAttribute("aria-hidden", "true");
    m.innerHTML = "<i></i><i></i><i></i>";
    this.body.appendChild(m);
    this.body.scrollTop = this.body.scrollHeight;
    var self = this;
    this.timer = setTimeout(function () {
      m.remove();
      done();
    }, 900);
  };

  ChatEngine.prototype.run = function (key) {
    var self = this;
    var steps = SCENARIOS[key].steps.slice();
    var i = 0;
    function next() {
      if (i >= steps.length) return;
      var s = steps[i++];
      if (s.from === "bot") {
        self.typing(function () { self.addMsg("bot", s.text, function () { if (s.end) { self.offerReset(); } next(); }); });
      } else if (s.from === "choice") {
        self.qr.innerHTML = "";
        s.options.forEach(function (opt) {
          var b = el("button", "qr", opt);
          b.type = "button";
          b.addEventListener("click", function () {
            self.qr.innerHTML = "";
            self.addMsg("out", opt, next);
          });
          self.qr.appendChild(b);
        });
      }
    }
    next();
  };

  ChatEngine.prototype.offerReset = function () {
    var b = el("button", "demo-reset", "Rejouer ce scénario");
    b.type = "button";
    var self = this;
    b.addEventListener("click", function () { b.remove(); });
    this.qr.appendChild(b);
  };

  /* ---------- Page bot-demo ---------- */
  function initDemo() {
    var body = document.getElementById("chat-body");
    var qr = document.getElementById("quick-replies");
    if (!body || !qr) return;
    var engine = new ChatEngine(body, qr);
    var buttons = document.querySelectorAll(".scenario-btn");
    var note = document.getElementById("demo-price-note");
    if (note) note.textContent = PRICE_NOTE;

    function select(btn) {
      buttons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      engine.clear();
      engine.run(btn.getAttribute("data-scenario"));
    }
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () { select(btn); });
    });
    var reset = document.getElementById("demo-reset-all");
    if (reset) {
      reset.addEventListener("click", function () {
        var active = document.querySelector(".scenario-btn.active");
        engine.clear();
        if (active) engine.run(active.getAttribute("data-scenario"));
      });
    }
    if (buttons.length) select(buttons[0]);
  }

  /* ---------- Hero : lecture automatique ---------- */
  function initHero() {
    var body = document.getElementById("hero-chat");
    if (!body) return;
    var script = [
      ["out", "Bonjour ! Je voudrais un balayage samedi 🙏"],
      ["bot", "Bonjour Camille ! Avec plaisir. Samedi, il me reste 10h30 ou 14h00."],
      ["out", "10h30 c'est parfait"],
      ["bot", "C'est réservé ! Balayage — samedi 10h30. Rappel la veille. À samedi !"]
    ];
    var i = 0;
    function loop() {
      if (i >= script.length) {
        setTimeout(function () {
          body.innerHTML = "";
          i = 0;
          loop();
        }, 3600);
        return;
      }
      var item = script[i++];
      if (item[0] === "bot") {
        var t = el("div", "msg in typing");
        t.setAttribute("aria-hidden", "true");
        t.innerHTML = "<i></i><i></i><i></i>";
        body.appendChild(t);
        setTimeout(function () {
          t.remove();
          push(item);
        }, 800);
      } else {
        setTimeout(function () { push(item); }, 700);
      }
      function push(it) {
        var m = el("div", "msg " + (it[0] === "bot" ? "in" : "out"), it[1]);
        var tm = el("time", null, now());
        m.appendChild(tm);
        body.appendChild(m);
        body.scrollTop = body.scrollHeight;
        loop();
      }
    }
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      script.forEach(function (it) {
        var m = el("div", "msg " + (it[0] === "bot" ? "in" : "out"), it[1]);
        body.appendChild(m);
      });
    } else {
      loop();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initDemo();
    initHero();
  });
})();
