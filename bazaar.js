document.addEventListener("DOMContentLoaded", function () {
  //
  //

  // COCKTAIL EXPIRER
  function hideExpiredItems() {
    // Get the current date and time
    const now = new Date();

    // Query all items with a data-expire attribute
    document.querySelectorAll("[data-expire]").forEach((item) => {
      // Parse the expire date from the attribute
      const expireDate = new Date(item.getAttribute("data-expire"));

      // If the expiration date is in the past, hide the item
      if (expireDate < now) {
        item.style.display = "none"; // or item.remove() if you want to remove it completely
        item.remove();
      }
    });
  }

  hideExpiredItems();

  // Highlighter
  function highlighter(element) {
    const highlightPosition =
      parseInt(element.getAttribute("data-highlight")) || 0;
    const highlightColor = element.getAttribute("data-color") || "#f0f0f0";
    const words = element.textContent.split(" ");

    if (highlightPosition > 0 && highlightPosition <= words.length) {
      words[
        highlightPosition - 1
      ] = `<span style="color:${highlightColor}; margin: 0em .4em;">${
        words[highlightPosition - 1]
      }</span>`;
    }
    element.innerHTML = words.join(" ");
  }

  // hightlighter callback
  document
    .querySelectorAll("[data-highlight][data-color]")
    .forEach(highlighter);
  // -------------------------------------------- END

  // POPUP Start
  $("[is-popup='true']").on("click", function () {
    // Clone the content to avoid removing it from the original
    var popupContent = $(this).find("[data-popup-content]").clone(true);
    $(".small-popup .popup-content").empty();
    $(".small-popup .popup-content").append(popupContent);
    $(".small-popup .popup-content div").css("display", "flex");
    $(".small-popup").addClass("active");
  });

  // Close popup
  $("[closepop]").on("click", function (event) {
    event.stopPropagation(); // Stop event bubbling

    var $this = $(this);
    var $activePopup = $this.closest(".popups").find(".active");
    $activePopup.removeClass("active");
    $activePopup.one(
      "transitionend webkitTransitionEnd oTransitionEnd",
      function () {
        if ($this.closest(".popups").find(".active").length === 0) {
          $(this).find(".popup-content").empty();
        }
      }
    );
  }); // ---------------------------------- Popup END

  // custom Links
  $("[custom-link]").each(function () {
    var customLink = $(this).attr("custom-link");
    $(this).attr("href", customLink);
  }); // ------------------------------------------- end

  // NAV //
  $(".nav-mobile-button").on("click", function () {
    $(".nav-container").toggleClass("active");
  }); // --- end

  // NAV LINE ANIMATION
  document.querySelectorAll(".navlink").forEach((link) => {
    link.addEventListener("mouseenter", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left; // Position within the element from the left.
      const width = rect.width;
      const fromLeft = x < width / 2;

      this.style.setProperty("--mouse-x", `${x}px`);
      this.classList.add(fromLeft ? "from-left" : "from-right");
    });

    link.addEventListener("mouseleave", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const leavingToLeft = x < width / 2;

      this.classList.remove("from-left", "from-right"); // Remove entry animation class
      this.classList.add(
        leavingToLeft ? "leaving-to-left" : "leaving-to-right"
      );

      // Reset after animation completion
      setTimeout(() => {
        this.classList.remove("leaving-to-left", "leaving-to-right");
      }, 300); // Should match the CSS transition duration
    });
  }); // ------------------------------------------------------------- END

  // ----------------------------------------------------------------------------------------------- SLIDER Full Page

  function slider(container) {
    const slideTime =
      (parseFloat(container.getAttribute("data-slidetime")) || 12) * 1000;
    const baseTransitionOutTime =
      parseFloat(container.getAttribute("data-transition-out")) * 1000 || 1000;
    let slideItems = Array.from(container.children).filter(
      (child) => child.tagName === "DIV"
    );

    let currentPosition = 1;

    function calculateTransitionTime(baseTime) {
      return baseTime;
    }

    let transitionOutTime = calculateTransitionTime(baseTransitionOutTime);

    function setupSlidePositions() {
      slideItems.forEach((slide, index) => {
        slide.setAttribute("data-p", (index + 1).toString());
        slide.setAttribute("data-slide", "inactive");
        slide.style.opacity = "0"; // Start with slides hidden
        slide.style.transform = "translateX(100%)"; // Slide in from right
        slide.style.display = "none";

        const children = slide.querySelectorAll("[data-sliding-in]");
        children.forEach((child) => {
          const styles = parseStyles(child.getAttribute("data-sliding-in"));
          Object.assign(child.style, styles);
        });
      });

      const firstSlide = slideItems[0];
      if (firstSlide) {
        firstSlide.setAttribute("data-slide", "active");
        applySlideStyle(firstSlide, "active");
      }
    }

    function parseStyles(styleString) {
      return styleString
        ? styleString.split(";").reduce((acc, style) => {
            let [property, value] = style.split(":").map((s) => s.trim());
            if (property && value) acc[property] = value;
            return acc;
          }, {})
        : {};
    }

    function applySlideStyle(slide, state) {
      if (state === "active") {
        slide.style.transition = "none"; // No transition for display change
        slide.style.display = "flex";
        void slide.offsetHeight; // Trigger reflow

        slide.style.transition = `opacity ${
          transitionOutTime / 800
        }s ease-in, transform ${transitionOutTime / 500}s ease`;
        slide.style.opacity = "1";
        slide.style.transform = "translateX(0)";

        const children = slide.querySelectorAll("[data-sliding-in]");
        children.forEach((child, index) => {
          const delay = parseFloat(child.getAttribute("data-delay-in")) || 0;
          child.style.transition = `opacity ${
            transitionOutTime / 800
          }s ease-in, transform ${transitionOutTime / 800}s ease`;
          setTimeout(() => {
            child.style.opacity = "1";
            child.style.transform = "translateX(0)";
          }, delay * 800);
        });
      } else if (state === "inactive") {
        slide.style.transition = `opacity ${
          transitionOutTime / 800
        }s ease-out, transform ${transitionOutTime / 800}s ease`;
        slide.style.opacity = "0";
        slide.style.transform = "translateX(100%)";
        setTimeout(() => (slide.style.display = "none"), transitionOutTime);
      }
    }

    function findNextSlide() {
      const currentSlide = slideItems.find(
        (slide) => slide.getAttribute("data-slide") === "active"
      );
      const currentPos = currentSlide
        ? parseInt(currentSlide.getAttribute("data-p"))
        : 0;
      const nextPos = (currentPos % slideItems.length) + 1;
      return slideItems.find(
        (slide) => slide.getAttribute("data-p") === String(nextPos)
      );
    }

    async function nextSlide() {
      const oldSlide = slideItems.find(
        (slide) => slide.getAttribute("data-slide") === "active"
      );
      const newSlide = findNextSlide();
      if (!newSlide) return;

      oldSlide.setAttribute("data-slide", "inactive");
      applySlideStyle(oldSlide, "inactive");

      newSlide.setAttribute("data-slide", "active");
      applySlideStyle(newSlide, "active");

      currentPosition = parseInt(newSlide.getAttribute("data-p"));
    }

    function refreshSlides() {
      slideItems = Array.from(container.children).filter(
        (child) => child.tagName === "DIV"
      );
      setupSlidePositions();
    }

    // Initial setup
    setupSlidePositions();

    // Start the slider
    let interval = setInterval(nextSlide, slideTime);

    // Check for slide changes every 20 seconds
    let checkInterval = setInterval(refreshSlides, 80800);

    // Event listeners for visibility and resizing
    window.addEventListener("resize", () => {
      transitionOutTime = calculateTransitionTime(baseTransitionOutTime);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        clearInterval(interval);
        clearInterval(checkInterval);
      } else if (document.visibilityState === "visible") {
        interval = setInterval(nextSlide, slideTime);
        checkInterval = setInterval(refreshSlides, 80800);
      }
    });

    return {
      interval: interval,
      stop: function () {
        clearInterval(interval);
        clearInterval(checkInterval);
      },
    };
  }

  document.querySelectorAll("[data-slider]").forEach(slider);

  // ----------------------------------------------------------------------------------------------- SLIDER Full Page END

  // ------------------------------------------------------------------- SLIDER itemized
  //
  function createSlider(
    sliderClass,
    itemClass,
    timerDuration = 5000,
    selectedItem = 1
  ) {
    const slider = document.querySelector(sliderClass);
    if (!slider) return console.error("Slider container not found");

    const items = slider.querySelectorAll(`.${itemClass}`);
    const nextButton = slider.querySelector("[next]");
    const prevButton = slider.querySelector("[prev]");

    let currentIndex = 0;
    let startX,
      currentX,
      isDragging = false,
      hasMoved = false;
    let timer;

    function updateSliderPosition(baseIndex) {
      currentIndex = (baseIndex + items.length) % items.length;
      items.forEach((item, idx) => {
        let newPos = ((idx - currentIndex + items.length) % items.length) + 1;
        item.setAttribute("position", newPos.toString());
      });
    }

    function moveSlider(direction) {
      currentIndex = (currentIndex + direction + items.length) % items.length;
      updateSliderPosition(currentIndex);
    }

    function startTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => moveSlider(1), timerDuration);
    }

    startTimer();

    function manualMove(direction) {
      moveSlider(direction);
      clearInterval(timer);
      startTimer();
    }

    if (nextButton) nextButton.addEventListener("click", () => manualMove(1));
    if (prevButton) prevButton.addEventListener("click", () => manualMove(-1));

    // Touch events for dragging
    slider.addEventListener("touchstart", handleTouchStart, { passive: true });
    slider.addEventListener("touchmove", handleTouchMove, { passive: true });
    slider.addEventListener("touchend", handleTouchEnd);

    function handleTouchStart(e) {
      startX = e.touches[0].clientX;
      currentX = startX;
      isDragging = true;
      hasMoved = false;
      if (timer) clearInterval(timer); // Stop the automatic slide when user starts dragging
    }

    function handleTouchMove(e) {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diff = startX - currentX;
      const slideWidth = slider.querySelector(`.${itemClass}`).clientWidth;
      const threshold = slideWidth / 2; // A bit less sensitive

      if (Math.abs(diff) > threshold && !hasMoved) {
        const direction = diff > 0 ? 1 : -1;
        moveSlider(direction);
        hasMoved = true;
      }
    }

    function handleTouchEnd() {
      isDragging = false;
      startTimer(); // Restart the automatic slide
    }

    // Click event for items
    items.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event from bubbling up to slider
        const clickedIndex = Array.from(items).indexOf(e.currentTarget);
        if (sliderClass.includes("cocktails")) {
          // For cocktails, align the clicked item to be the 3rd item
          updateSliderPosition(clickedIndex - 2);
        } else {
          // For vendors, align the clicked item to be the 1st item
          updateSliderPosition(clickedIndex);
        }
        clearInterval(timer);
        startTimer();
      });
    });

    // Hover functionality
    function handleHover() {
      clearInterval(timer);
    }

    function handleLeave() {
      startTimer();
    }

    if (nextButton) {
      nextButton.addEventListener("mouseenter", handleHover);
      nextButton.addEventListener("mouseleave", handleLeave);
    }
    if (prevButton) {
      prevButton.addEventListener("mouseenter", handleHover);
      prevButton.addEventListener("mouseleave", handleLeave);
    }
  }

  // Example usage:
  createSlider(".cocktails-section", "cocktail-s", 16000, 3);
  createSlider(".vendors-section", "vendor-s", 10000, 1);

  //
  //
}); // DOM loaded