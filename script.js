"use strict";

// Progressive enhancement: sections and project information remain readable
// without JavaScript. Native dialogs provide Escape and keyboard containment.
document.documentElement.classList.add("js");
const menuButton = document.querySelector(".pf-menu-button");
const navigation = document.querySelector(".pf-nav");
const menu = document.querySelector("#pf-menu");
let returnFocus = null;

function closeMenu(restoreFocus = false) {
  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") !== "true";
  navigation.classList.toggle("is-open", expanded);
  menuButton.setAttribute("aria-expanded", String(expanded));
});
menu.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("click", (event) => {
  if (!navigation.contains(event.target)) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open"))
    closeMenu(true);
});
// Native anchor navigation updates the hash and works with browser history.
// Move keyboard focus to the destination so a collapsed mobile menu never
// leaves focus in hidden navigation.
document.querySelectorAll('a[href^="#"]:not([data-open])').forEach((link) => {
  link.addEventListener("click", () => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
});

document.querySelectorAll("[data-open]").forEach((trigger) => {
  const dialog = document.querySelector("#pf-dialog-" + trigger.dataset.open);
  if (!dialog || typeof dialog.showModal !== "function") return;
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    closeMenu();
    returnFocus = trigger;
    dialog.showModal();
    document.querySelector(".pf").classList.add("pf-modal-open");
    dialog.querySelector("h2").focus({ preventScroll: true });
  });
});
document.querySelectorAll(".pf-dialog").forEach((dialog) => {
  dialog
    .querySelector("[data-close]")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.querySelector(".pf").classList.remove("pf-modal-open");
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  });
});

const contactForm = document.querySelector(".pf-contact-form");
const formStatus = contactForm.querySelector(".pf-form-status");
const fields = [...contactForm.querySelectorAll("input, textarea")];
// Keep native validation as the no-JS fallback, add explicit inline feedback.
contactForm.noValidate = true;
function validateField(field) {
  const error = document.querySelector("#error-" + field.name);
  let message = "";
  if (!field.value.trim())
    message =
      field.name === "message"
        ? "Please add a message."
        : "Please enter your " +
          (field.name === "name" ? "name." : "email address.");
  else if (field.validity.typeMismatch)
    message = "Enter a valid email address, such as name@example.com.";
  else if (!field.validity.valid) message = "Please check this field.";
  field.setAttribute("aria-invalid", String(Boolean(message)));
  error.textContent = message;
  return !message;
}
fields.forEach((field) => {
  field.addEventListener("blur", () => {
    if (field.value || field.hasAttribute("aria-invalid")) validateField(field);
  });
  field.addEventListener("input", () => {
    if (field.getAttribute("aria-invalid") === "true") validateField(field);
    formStatus.textContent = "";
  });
});
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const validity = fields.map(validateField);
  if (validity.includes(false)) {
    fields[validity.indexOf(false)].focus();
    formStatus.textContent =
      "Check the highlighted fields before creating your draft.";
    return;
  }
  const data = new FormData(contactForm);
  const name = data.get("name").trim();
  const subject = "Portfolio inquiry from " + name;
  const body =
    data.get("message").trim() +
    "\n\nFrom: " +
    name +
    " (" +
    data.get("email").trim() +
    ")";
  const email = document.querySelector(".pf-email").href.split("?")[0];
  const draft = document.createElement("a");
  draft.href =
    email +
    "?subject=" +
    encodeURIComponent(subject) +
    "&body=" +
    encodeURIComponent(body);
  document.body.appendChild(draft);
  draft.click();
  draft.remove();
  formStatus.textContent =
    "Email draft requested. Review and send it in your email app. If nothing opened, use the email link. No message has been sent by this website.";
});

function initPortfolioMotion(root) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const controller = new AbortController(),
    opts = { signal: controller.signal };
  const cleanups = [];
  const select = (s) => root.querySelector(s);
  const all = (s) => Array.from(root.querySelectorAll(s));
  if ("IntersectionObserver" in window && !reduced.matches) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("pf-visible");
            observer.unobserve(entry.target);
          }
        }),
      { root, threshold: 0.12, rootMargin: "0px 0px -24px 0px" },
    );
    all(".pf-reveal").forEach((el) => observer.observe(el));
    cleanups.push(() => observer.disconnect());
  }
  // Split the hero title into per-letter windows for the staggered entrance,
  // like the reference site's display title.
  let letterIndex = 0;
  all(".pf-title-line").forEach((line) => {
    const text = line.textContent;
    line.setAttribute("aria-hidden", "true");
    line.textContent = "";
    Array.from(text).forEach((ch) => {
      const w = document.createElement("span");
      w.className = "pf-lw";
      const l = document.createElement("span");
      l.className = "pf-l";
      l.style.setProperty("--i", letterIndex++);
      l.textContent = ch;
      w.appendChild(l);
      line.appendChild(w);
    });
  });
  // Portrait journey: a single card travels from the hero anchor down to the
  // biography figure while scrolling, growing and flipping over on the way,
  // like the reference site. The static anchors stay as the no-motion fallback.
  let scrollFrame = 0;
  const main = select("main");
  const heroAnchor = select(".pf-intro-portrait");
  const bioFigure = select(".pf-bio-portrait");
  if (!reduced.matches && main && heroAnchor && bioFigure) {
    const journey = document.createElement("div");
    journey.className = "pf-journey";
    journey.setAttribute("aria-hidden", "true");
    const stage = document.createElement("div");
    stage.className = "pf-journey-stage";
    const card = document.createElement("div");
    card.className = "pf-journey-card";
    const front = document.createElement("div");
    front.className = "pf-journey-face";
    front.innerHTML = heroAnchor.innerHTML;
    const back = front.cloneNode(true);
    back.classList.add("pf-back");
    card.append(front, back);
    stage.appendChild(card);
    journey.appendChild(stage);
    main.prepend(journey);
    root.classList.add("pf-journey-on");
    const easeInOut = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const lerp = (a, b, t) => a + (b - a) * t;
    const t0 = performance.now();
    let raf = 0,
      lastY = -1,
      cur = null;
    const apply = () => {
      raf = 0;
      const mainRect = main.getBoundingClientRect();
      const stageH = root.clientHeight;
      const hr = heroAnchor.getBoundingClientRect(),
        br = bioFigure.getBoundingClientRect();
      const heroDoc = {
        x: hr.left - mainRect.left,
        y: hr.top - mainRect.top,
        w: hr.width,
        h: hr.height,
      };
      const bioDoc = {
        x: br.left - mainRect.left,
        y: br.top - mainRect.top,
        w: br.width,
        h: br.height,
      };
      const journeyH = bioDoc.y + bioDoc.h;
      journey.style.height = journeyH + "px";
      stage.style.height = stageH + "px";
      const range = Math.max(journeyH - stageH, 1);
      const s = root.scrollTop;
      const p = Math.min(Math.max(s / range, 0), 1);
      const e = easeInOut(p);
      const stageTop = Math.min(Math.max(s, 0), range);
      const k = easeOut(
        Math.min(Math.max((performance.now() - t0 - 450) / 1000, 0), 1),
      );
      const target = {
        x: lerp(heroDoc.x, bioDoc.x, e),
        y: lerp(heroDoc.y, bioDoc.y, e) - stageTop + (1 - k) * 36,
        w: lerp(heroDoc.w, bioDoc.w, e),
        h: lerp(heroDoc.h, bioDoc.h, e),
        r: lerp(7, 12, e),
        rot: 180 * e,
      };
      if (!cur) cur = { ...target };
      let still = s === lastY && k >= 1;
      for (const key of ["x", "y", "w", "h", "r", "rot"]) {
        const d = target[key] - cur[key];
        if (Math.abs(d) > 0.05) still = false;
        cur[key] += d * 0.22;
      }
      card.style.left = cur.x + "px";
      card.style.top = cur.y + "px";
      card.style.width = cur.w + "px";
      card.style.height = cur.h + "px";
      card.style.borderRadius = cur.r + "px";
      card.style.transform = "perspective(1200px) rotateY(" + cur.rot + "deg)";
      card.style.opacity = k;
      lastY = s;
      if (!still) raf = requestAnimationFrame(apply);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    root.addEventListener("scroll", kick, { ...opts, passive: true });
    window.addEventListener("resize", kick, opts);
    apply();
    cleanups.push(() => cancelAnimationFrame(raf));
  }
  // Experience roadmap: draw the winding road through the stop markers, then
  // ink it when the section scrolls into view, like the reference site.
  const roadmap = select(".pf-roadmap");
  if (roadmap) {
    const buildRoad = () => {
      const svg = roadmap.querySelector(".pf-road");
      if (!svg || getComputedStyle(svg).display === "none") return;
      const rm = roadmap.getBoundingClientRect();
      const pts = all(".pf-stop").map((st) => {
        const m = st.querySelector(".pf-stop-marker").getBoundingClientRect();
        return {
          x: m.left - rm.left + m.width / 2,
          y: m.top - rm.top + m.height / 2,
        };
      });
      if (pts.length < 2 || !rm.width) return;
      let d = "M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1],
          b = pts[i],
          mx = (a.x + b.x) / 2;
        d +=
          " C " +
          mx.toFixed(1) +
          " " +
          a.y.toFixed(1) +
          ", " +
          mx.toFixed(1) +
          " " +
          b.y.toFixed(1) +
          ", " +
          b.x.toFixed(1) +
          " " +
          b.y.toFixed(1);
      }
      svg.setAttribute(
        "viewBox",
        "0 0 " + rm.width.toFixed(1) + " " + rm.height.toFixed(1),
      );
      svg.querySelectorAll("path").forEach((pa) => pa.setAttribute("d", d));
    };
    buildRoad();
    // Ink the road progressively as the visitor scrolls through the section,
    // so the path draws itself in step with the scroll position.
    const inkTo = () => {
      const svg = roadmap.querySelector(".pf-road");
      const el = roadmap.querySelector(".pf-road-ink");
      if (!svg || !el || getComputedStyle(svg).display === "none") return;
      if (reduced.matches) {
        el.style.strokeDashoffset = "0";
        return;
      }
      const rect = roadmap.getBoundingClientRect();
      const vh = root.clientHeight || window.innerHeight;
      const progress = Math.min(
        Math.max((vh * 0.9 - rect.top) / (rect.height + vh * 0.35), 0),
        1,
      );
      el.style.strokeDashoffset = (1 - progress).toFixed(4);
    };
    let inkFrame = 0;
    const kickInk = () => {
      if (inkFrame) return;
      inkFrame = requestAnimationFrame(() => {
        inkFrame = 0;
        // Markers move while their reveal transition runs, so refresh the
        // path geometry alongside the ink progress.
        buildRoad();
        inkTo();
      });
    };
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(() => {
        buildRoad();
        inkTo();
      });
    window.addEventListener(
      "resize",
      () => {
        buildRoad();
        kickInk();
      },
      opts,
    );
    root.addEventListener("scroll", kickInk, { ...opts, passive: true });
    inkTo();
  }
  // Hero code spotlight: a brighter layer of code snippets over the faint
  // static background, revealed through a soft mask that follows the cursor,
  // like the reference video.
  const intro = select(".pf-intro");
  if (intro && fine.matches && !reduced.matches) {
    const reveal = document.createElement("div");
    reveal.className = "pf-code-reveal";
    reveal.setAttribute("aria-hidden", "true");
    const snippets = [
      "const developer = {",
      "  name: 'Estevan Maher',",
      "  role: 'front-end',",
      "  city: 'Alexandria',",
      "};",
      "function build(idea) {",
      "  return create(idea);",
      "}",
      "const stack = ['HTML',",
      "  'CSS', 'JavaScript'];",
      "stack.map(learn);",
      "fetch('/projects')",
      "  .then(res => res.json())",
      "  .then(render);",
      '<section id="hero">',
      "  <h1>Front-end</h1>",
      "</section>",
      ":root {",
      "  --ink: #f6f5f2;",
      "  --bg: #191818;",
      "}",
      "let focus = true;",
      "while (focus) { ship(); }",
      "// build. learn. repeat.",
      "cells.forEach(cell =>",
      "  cell.fadeIn());",
      "export default App;",
      "addEventListener('move',",
      "  e => reveal(e.x, e.y));",
      "requestAnimationFrame(draw);",
    ];
    [
      [0, 0],
      [21, 70],
      [43, 15],
      [64, 90],
      [85, 35],
    ].forEach((c, ci) => {
      const pre = document.createElement("pre");
      const out = [];
      for (let i = 0; i < 15; i++)
        out.push(snippets[(ci * 7 + i * 3) % snippets.length]);
      pre.textContent = out.join("\n");
      pre.style.left = c[0] + "%";
      pre.style.top = c[1] + "px";
      reveal.appendChild(pre);
    });
    intro.prepend(reveal);
    let htx = 0,
      hty = 0,
      hcx = 0,
      hcy = 0,
      hact = 0,
      hgoal = 0,
      hraf = 0,
      hstarted = false;
    const hloop = () => {
      hraf = 0;
      hcx += (htx - hcx) * 0.18;
      hcy += (hty - hcy) * 0.18;
      hact += (hgoal - hact) * 0.14;
      reveal.style.setProperty("--mx", hcx.toFixed(1) + "px");
      reveal.style.setProperty("--my", hcy.toFixed(1) + "px");
      reveal.style.setProperty("--po", hact.toFixed(3));
      if (
        Math.abs(htx - hcx) > 0.2 ||
        Math.abs(hty - hcy) > 0.2 ||
        Math.abs(hgoal - hact) > 0.004
      )
        hraf = requestAnimationFrame(hloop);
    };
    const hkick = () => {
      if (!hraf) hraf = requestAnimationFrame(hloop);
    };
    intro.addEventListener(
      "pointermove",
      (e) => {
        const r = reveal.getBoundingClientRect();
        htx = e.clientX - r.left;
        hty = e.clientY - r.top;
        if (!hstarted) {
          hcx = htx;
          hcy = hty;
          hstarted = true;
        }
        hgoal = 1;
        hkick();
      },
      opts,
    );
    intro.addEventListener(
      "pointerleave",
      () => {
        hgoal = 0;
        hkick();
      },
      opts,
    );
    cleanups.push(() => cancelAnimationFrame(hraf));
  }
  if (fine.matches && !reduced.matches)
    all(".pf-button").forEach((button) => {
      button.addEventListener(
        "pointermove",
        (e) => {
          const r = button.getBoundingClientRect();
          button.style.transform =
            "translate(" +
            (e.clientX - r.left - r.width / 2) * 0.09 +
            "px," +
            (e.clientY - r.top - r.height / 2) * 0.13 +
            "px)";
        },
        opts,
      );
      button.addEventListener(
        "pointerleave",
        () => {
          button.style.transform = "";
        },
        opts,
      );
    });
  reduced.addEventListener("change", () => {
    if (!reduced.matches) return;
    controller.abort();
    cleanups.forEach((cleanup) => cleanup());
    root.classList.remove("pf-journey-on");
    root.querySelector(".pf-journey")?.remove();
    root.querySelector(".pf-code-reveal")?.remove();
    all(".pf-button").forEach((button) => {
      button.style.transform = "";
    });
  });
}
initPortfolioMotion(document.querySelector(".pf"));

if ("IntersectionObserver" in window) {
  const root = document.querySelector(".pf");
  const links = [...document.querySelectorAll("#pf-menu a")];
  const activeSections = new IntersectionObserver(
    (entries) => {
      const entry = entries
        .filter((item) => item.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!entry) return;
      links.forEach((link) => {
        if (link.hash === "#" + entry.target.id)
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    },
    { root, rootMargin: "-10% 0px -45% 0px", threshold: [0, 0.1, 0.25, 0.5] },
  );
  document
    .querySelectorAll("main>section")
    .forEach((section) => activeSections.observe(section));
}
