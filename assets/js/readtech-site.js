(function () {
  const body = document.body;
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const scrollButtons = document.querySelectorAll("[data-scroll-target]");
  const contactForms = document.querySelectorAll("[data-contact-form]");

  if (header) {
    const setHeaderState = () => {
      header.dataset.scrolled = window.scrollY > 8 ? "true" : "false";
    };

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });
  }

  if (toggle && nav) {
    const openMenu = () => {
      body.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
      nav.dataset.open = "true";
      const firstLink = nav.querySelector("a");

      if (firstLink) {
        firstLink.focus({ preventScroll: true });
      }
    };

    const closeMenu = () => {
      body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      nav.dataset.open = "false";
    };

    toggle.addEventListener("click", () => {
      if (body.classList.contains("nav-open")) {
        closeMenu();
        return;
      }

      openMenu();
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        toggle.focus({ preventScroll: true });
      }
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 861px)").matches) {
        closeMenu();
      }
    });
  }

  scrollButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-scroll-target");
      const target = targetId ? document.getElementById(targetId) : null;

      if (!target) {
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "start" });

      if (target.hasAttribute("tabindex")) {
        target.focus({ preventScroll: true });
      }
    });
  });

  contactForms.forEach(setupContactForm);

  function setupContactForm(contactForm) {
    if (!window.fetch || !window.FormData) {
      return;
    }

    const status = contactForm.querySelector("[data-form-status]");
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const defaultButtonText = submitButton ? submitButton.textContent : "";

    const setStatus = (message, state) => {
      if (!status) {
        return;
      }

      status.textContent = message;
      status.dataset.state = state || "";
    };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      setStatus("Sending your notes...", "pending");

      try {
        const response = await fetch(contactForm.action, {
          method: contactForm.method,
          body: new FormData(contactForm),
          headers: {
            Accept: "application/json"
          }
        });

        if (response.ok) {
          contactForm.reset();
          setStatus("Thanks. Your process notes were sent.", "success");
          return;
        }

        let errorMessage = "Something went wrong. Your message was not sent, and the form has not been cleared.";

        try {
          const data = await response.json();
          if (data && Array.isArray(data.errors) && data.errors.length > 0) {
            errorMessage = data.errors.map((error) => error.message).filter(Boolean).join(" ");
          }
        } catch (error) {
          // Formspree may return a non-JSON error page; keep the safe fallback.
        }

        setStatus(errorMessage, "error");
      } catch (error) {
        setStatus("Could not reach the form service. Your message was not sent, and the form has not been cleared.", "error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = defaultButtonText;
        }
      }
    });
  }
})();
