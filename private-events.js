$(document).ready(function () {
  // ------------------- SECTION 1: INITIALIZATION AND CACHING -------------------
  const $form = $("form[data-step]");
  const $steps = $(".step");
  const $backButton = $('[data-form-control="back"]');
  const $messageBox = $(".message-box");

  const $fnameInput = $('input[name="fname"]');
  const $lnameInput = $('input[name="lname"]');
  const $companyInput = $('input[name="company"]');
  const $emailInput = $('input[name="email"]');
  const $phoneInput = $('input[name="phone"]');
  const $dateInput = $('input[name="date"]');
  const $partyInput = $('input[name="party"]');
  const $timeInput = $('input[name="time"]');
  const $hoursInput = $('input[name="hours"]');
  const $occasionSelect = $('select[name="occasion"]');

  const $menuInputs = $("div.food-add.mobile-keep input[data-item]");

  let currentStepElement = null;

  // Variables for total calculation
  let total = 0;
  let party = 0;
  let menu = [];
  let items = [];

  // Modal element
  const $modal = $("#total-modal");
  const $modalTotal = $("#modal-total");
  const $closeModal = $("#close-modal");

  // ------------------- SECTION 2: UPDATE FUNCTIONS FOR FORM FIELDS -------------------
  function updateName() {
    const fname = $fnameInput.val().trim();
    const lname = $lnameInput.val().trim();
    const fullName =
      fname && lname ? `${fname} ${lname}` : fname || lname || "";
    document
      .querySelector('[data-info="name"]')
      .style.setProperty("--fullName", `"${fullName}"`);
  }

  function updateCompany() {
    const company = $companyInput.val().trim();
    document
      .querySelector('[data-info="company"]')
      .style.setProperty("--company", `"${company}"`);
  }

  function updateEmail() {
    const email = $emailInput.val().trim();
    document
      .querySelector('[data-info="email"]')
      .style.setProperty("--email", `"${email}"`);
  }

  function updatePhone() {
    const phone = $phoneInput.val().trim();
    document
      .querySelector('[data-info="phone"]')
      .style.setProperty("--phone", `"${phone}"`);
  }

  function updateDate() {
    const date = $dateInput.val().trim();
    document
      .querySelectorAll('[data-info="date"]')
      .forEach((element) => element.style.setProperty("--date", `"${date}"`));
  }

  function updateParty() {
    party = parseInt($partyInput.val()) || 0;
    document
      .querySelector('[data-info="party"]')
      .style.setProperty("--party", `"${party}"`);
    calculateTotal();
  }

  function updateTime() {
    const time = $timeInput.val().trim();
    document
      .querySelector('[data-info="time"]')
      .style.setProperty("--time", `"${time}"`);
  }

  function updateHours() {
    let hours = parseInt($hoursInput.val()) || 0;
    const minHours = 2;

    if (hours < minHours || isNaN(hours)) {
      hours = minHours;
      $hoursInput.val(hours);
      const event = new Event("input", { bubbles: true });
      $hoursInput[0].dispatchEvent(event);
    }

    document
      .querySelector('[data-info="hours"]')
      .style.setProperty("--hours", `"${hours}"`);
    calculateTotal();
  }

  function updateOccasion() {
    const occasion = $occasionSelect.val().trim();
    const capitalizedOccasion =
      occasion.charAt(0).toUpperCase() + occasion.slice(1);
    document
      .querySelectorAll('[data-info="occasion"]')
      .forEach((element) =>
        element.style.setProperty("--occasion", `"${capitalizedOccasion}"`)
      );
  }

  function updateMenu() {
    menu = [];

    $menuInputs.each(function () {
      const count = parseInt($(this).val()) || 0;
      if (count > 0) {
        const dataItem = $(this).attr("data-item");
        const itemName = dataItem
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        const itemCount = `(${count}) ${itemName}`;
        menu.push(itemCount);
      }
    });

    const displayText = menu.length > 0 ? menu.join(", ") : "";
    document
      .querySelector('[data-info="menu"]')
      .style.setProperty("--menu", `"${displayText}"`);

    // Update the input with name="menu"
    const $menuInput = $('input[name="menu"]');
    if ($menuInput.length) {
      $menuInput.val(displayText);
    }

    calculateTotal();
  }

  // Function to update the name attribute of menu item inputs
  function updateMenuItemNames() {
    const $itemInputs = $('input[name="item"]');
    $itemInputs.each(function () {
      const dataItem = $(this).attr("data-item");
      if (dataItem) {
        $(this).attr("name", dataItem);
      }
    });
  }

  // Function to update the name attribute of add-on inputs
  function updateAddOnNames() {
    const $addOnInputs = $('input[name="add-on"]');
    $addOnInputs.each(function () {
      const dataValue = $(this).attr("data-value");
      if (dataValue) {
        $(this).attr("name", dataValue);
      }
    });
  }

  // ------------------- SECTION 3: EVENT LISTENERS FOR FORM FIELDS -------------------
  $fnameInput.on("input", updateName);
  $lnameInput.on("input", updateName);
  $companyInput.on("input", updateCompany);
  $emailInput.on("input", updateEmail);
  $phoneInput.on("input", updatePhone);
  $dateInput.on("input", updateDate);
  $partyInput.on("input", updateParty);
  $timeInput.on("input", updateTime);
  $hoursInput.on("input", updateHours);
  $occasionSelect.on("change", updateOccasion);

  // Generic event listener to remove error attribute on input/change
  $form.on("input", "input, textarea", function () {
    $(this).removeAttr("error");
  });

  $form.on(
    "change",
    "select, input[type='radio'], input[type='checkbox']",
    function () {
      $(this).removeAttr("error");
    }
  );

  // ------------------- SECTION 4: FORM VALIDATION FUNCTIONS -------------------
  function validate1() {
    const errors = [];
    const fieldsToReset = [];
    $messageBox.attr("data-hidden", "");

    const fname = $fnameInput.val().trim();
    if (!fname) {
      fieldsToReset.push($fnameInput);
      errors.push("First Name cannot be empty.");
    }

    const lname = $lnameInput.val().trim();
    if (!lname) {
      fieldsToReset.push($lnameInput);
      errors.push("Last Name cannot be empty.");
    }

    const email = $emailInput.val().trim();
    const atCount = (email.match(/@/g) || []).length;
    const hasDot = email.includes(".");
    if (!email || atCount !== 1 || !hasDot) {
      fieldsToReset.push($emailInput);
      errors.push("Please enter a valid email address.");
    }

    const phone = $phoneInput.val().trim();
    const phonePattern = /^(?:\+?\d{1,3})?(?!.*(\d)\1{4,})\d{7,12}$/;
    if (!phone || !phonePattern.test(phone)) {
      fieldsToReset.push($phoneInput);
      errors.push("Phone must be a valid number (7-12 digits, Only numbers).");
    }

    const date = $dateInput.val();
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 0);
    const selectedDate = new Date(date);
    if (!date || selectedDate < minDate) {
      fieldsToReset.push($dateInput);
      errors.push("Date must be at least one week from today or later).");
    }

    const partyVal = parseInt($partyInput.val()) || 0;
    const partyMin = parseInt($partyInput.attr("min")) || 15;
    const partyMax = parseInt($partyInput.attr("max")) || 50;
    if (isNaN(partyVal) || partyVal < partyMin || partyVal > partyMax) {
      fieldsToReset.push($partyInput);
      errors.push(`Party size must be between ${partyMin} and ${partyMax}.`);
    }

    const time = $timeInput.val();
    const timeHours = parseInt(time.split(":")[0]);
    const timeMinutes = parseInt(time.split(":")[1]);
    const timeInMinutes = timeHours * 60 + timeMinutes;
    const minTime = 10 * 60;
    const maxTime = 22 * 60;
    if (!time || timeInMinutes < minTime || timeInMinutes > maxTime) {
      fieldsToReset.push($timeInput);
      errors.push("Time must be between 10:00 AM and 10:00 PM.");
    }

    const hours = parseInt($hoursInput.val()) || 0;
    const hoursMin = 2;
    const hoursMax = 8;
    if (isNaN(hours) || hours < hoursMin || hours > hoursMax) {
      fieldsToReset.push($hoursInput);
      errors.push("Event Hours must be between 2 and 8.");
    }

    //--- occasion disabled
    // const occasion = $occasionSelect.val().trim();
    // if (!occasion) {
    //   fieldsToReset.push($occasionSelect);
    //   errors.push("Occasion must be selected.");
    // }

    if (errors.length > 0) {
      fieldsToReset.forEach(($field) => $field.attr("error", ""));
      $messageBox.text(errors.join(" ")).removeAttr("data-hidden");
      return false;
    }
    return true;
  }

  function validate2() {
    const $barpackage = $('input[name="barpackage"]:checked');
    $messageBox.attr("data-hidden", "");

    if (!$barpackage.length) {
      $messageBox
        .text("Please select a Bar Package.")
        .removeAttr("data-hidden");
      return false;
    }
    return true;
  }

  function validate3() {
    return true;
  }

  // ------------------- SECTION 5: BAR PACKAGE AND ADD-ONS HANDLING -------------------
  $(".radio-field").each(function () {
    const dataValue = $(this).attr("data-value");
    $(this).find('input[type="radio"]').val(dataValue);
  });

  $(".check-field").each(function () {
    const dataValue = $(this).attr("data-value");
    const $checkbox = $(this).find('input[type="checkbox"]');
    $checkbox.val(dataValue);
    $checkbox.attr("name", dataValue);
  });

  function updateBarPackage() {
    const $selectedPackage = $('input[name="barpackage"]:checked');
    const dataValue = $selectedPackage.length ? $selectedPackage.val() : "";
    const displayText = dataValue
      ? dataValue
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "";
    document
      .querySelector('[data-info="barPackage"]')
      .style.setProperty("--barPackage", `"${displayText}"`);
    calculateTotal();
  }

  function updateAdditionalOptions() {
    const addons = [];
    $("label[data-item='addons'] input[type='checkbox']:checked").each(
      function () {
        const dataValue = $(this).val();
        const capitalizedValue = dataValue
          ? dataValue
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")
          : "";
        addons.push(capitalizedValue);
      }
    );
    const displayText = addons.length > 0 ? addons.join(", ") : "";
    const addonsElement = document.querySelector('[data-info="addons"]');
    if (addonsElement) {
      addonsElement.style.setProperty("--addons", `"${displayText}"`);
    }

    // Update the input with name="addons"
    const $addonsInput = $('input[name="addons"]');
    if ($addonsInput.length) {
      $addonsInput.val(displayText);
    }
  }

  $('input[name="barpackage"]').on("change", function () {
    updateBarPackage();
  });

  $("label[data-item='addons'] input[type='checkbox']").on(
    "change",
    function () {
      updateAdditionalOptions();
    }
  );

  // ------------------- SECTION 6: TOTAL CALCULATION AND MODAL -------------------
  function formatNumber(number) {
    const fixed = number.toFixed(2);
    const integerPart = Math.floor(number);
    if (integerPart < 1000) {
      return fixed;
    }
    const parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  function calculateTotal() {
    total = 0;

    // Bar Package Price
    const $selectedPackage = $('input[name="barpackage"]:checked');
    let barPrice = 0;
    let isMainPackage = false;
    if ($selectedPackage.length) {
      barPrice =
        parseFloat($selectedPackage.closest("label").attr("count-price")) || 0;
      const packageType =
        $selectedPackage.closest("label").attr("package") || "";
      isMainPackage = packageType.toLowerCase() === "main";
      total += barPrice * party;
    }

    // Menu Items Price
    let menuCost = 0;
    $menuInputs.each(function () {
      const count = parseInt($(this).val()) || 0;
      const price = parseFloat($(this).attr("count-price")) || 0;
      const itemCost = count * price;
      menuCost += itemCost;
    });
    total += menuCost;

    // Additional Hours Price ($10 per person per hour beyond 2 hours, only for Main package)
    const hours = parseInt($hoursInput.val()) || 2;
    let hoursCost = 0;
    if (isMainPackage && hours > 2) {
      const extraHours = hours - 2;
      hoursCost = extraHours * 10 * party;
      total += hoursCost;
    }

    // Format total
    const formattedTotal = formatNumber(total);

    // Update total in review section
    const totalElement = document.querySelector('[data-info="total"]');
    if (totalElement) {
      totalElement.style.setProperty("--total", `"$${formattedTotal}"`);
    }

    // Update the input with name="estimate"
    const $estimateInput = $('input[name="estimate"]');
    if ($estimateInput.length) {
      $estimateInput.val(formattedTotal);
    }

    // Show modal with total
    showModal(formattedTotal);
  }

  function showModal(formattedTotal) {
    $modalTotal.text(`$${formattedTotal}`);
    $modal.fadeIn(200);
  }

  // Modal close handler
  $closeModal.on("click", function () {
    $modal.fadeOut(200);
  });

  // Close modal when clicking outside
  $modal.on("click", function (e) {
    if ($(e.target).is($modal)) {
      $modal.fadeOut(200);
    }
  });

  // ------------------- SECTION 7: COUNTER HANDLING -------------------
  $(document).on("click", "[data-control]", function () {
    const $counter = $(this).closest("[counter], .food-add.mobile-keep");
    const $count = $counter.find("[count]");
    let count = parseInt($count.val()) || 0;
    const min = parseInt($count.attr("min")) || 0;
    const max = parseInt($count.attr("max")) || 350;
    const counterType = $counter.attr("counter");
    const control = $(this).attr("data-control");

    if (control === "add" && count < max) {
      count++;
      $count.val(count);
      if ($counter.hasClass("food-add mobile-keep")) {
        updateMenu();
      } else if (counterType === "hours") {
        $hoursInput.val(count);
        updateHours();
      }
    } else if (control === "drop" && count > min) {
      count--;
      $count.val(count);
      if ($counter.hasClass("food-add mobile-keep")) {
        updateMenu();
      } else if (counterType === "hours") {
        $hoursInput.val(count);
        updateHours();
      }
    }
  });

  // ------------------- SECTION 8: FORM NAVIGATION AND STEP VISIBILITY -------------------
  $("[data-form-control]").on("click", function () {
    if (!$form.length) {
      return;
    }

    const stepAttr = $form.attr("data-step");
    let step = parseInt(stepAttr);
    const maxAttr = $form.attr("data-stepmax");
    const max = parseInt(maxAttr);
    const control = $(this).attr("data-form-control");

    if (control === "next" && step <= max) {
      let canProceed = false;

      if (isNaN(step)) {
        step = 0;
        $form.attr("data-step", "0");
      }

      if (step === 0) {
        canProceed = true;
      } else if (step === 1) {
        canProceed = validate1();
      } else if (step === 2) {
        canProceed = validate2();
      } else if (step === 3) {
        canProceed = validate3();
      }

      if (canProceed) {
        step++;
        $form.attr("data-step", step.toString());

        if (currentStepElement) {
          currentStepElement.removeClass("active");
        }
        currentStepElement = $steps.filter(`[data-step-id="${step}"]`);
        if (currentStepElement.length) {
          currentStepElement.addClass("active");
        }

        if (step === 0) {
          $backButton.hide();
        } else {
          $backButton.show();
        }
      }
    } else if (control === "back" && step > 0) {
      step--;
      $form.attr("data-step", step.toString());

      if (currentStepElement) {
        currentStepElement.removeClass("active");
      }
      currentStepElement = $steps.filter(`[data-step-id="${step}"]`);
      if (currentStepElement.length) {
        currentStepElement.addClass("active");
      }

      if (step === 0) {
        $backButton.hide();
      } else {
        $backButton.show();
      }
    }
  });

  // Initial updates
  updateMenuItemNames(); // Update menu item names on load
  updateAddOnNames(); // Update add-on names on load
  updateName();
  updateCompany();
  updateEmail();
  updatePhone();
  updateDate();
  updateParty();
  updateTime();
  $hoursInput.val(2); // Set hours to 2 on page load
  updateHours(); // Trigger update to reflect the value
  updateOccasion();
  updateMenu();
  updateBarPackage();
  updateAdditionalOptions();
});