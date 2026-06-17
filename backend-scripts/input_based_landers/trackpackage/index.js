import {cachedFetch} from "../utils/cache";
import { initLander } from "../../core/lander";
import { eventNames } from "../../constants";
let tbinit = {
    [eventNames.ic] :  { notify: 'event', name: 'CTA-Click', id: 1795853 },
    [eventNames.tyimp]:{notify: 'event', name: 'AIBrowser_Generic_Install', id: 1795853}
}
initLander("Package",tbinit,"Package");

document.addEventListener("DOMContentLoaded", () => {
  const initApp = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          const navLinks = document.querySelector(".nav-links");
          const hamburgerMenu = document.querySelector(".hamburger-menu");
          if (navLinks.classList.contains("show")) {
            navLinks.classList.remove("show");
            hamburgerMenu.innerHTML = '<i class="ri-menu-line ri-lg"></i>';
          }
        }
      });
    });
  };
  window.toggleFAQ = (button) => {
    const content = button.nextElementSibling;
    const icon = button.querySelector("i");
    const isOpen = content.classList.contains("hidden");
    content.classList.toggle("hidden");
    icon.style.transform = isOpen ? "rotate(45deg)" : "";
  };
  initApp();
  window.addEventListener("load", () => {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.complete) {
        img.style.opacity = "0";
        img.addEventListener("load", () => {
          img.style.opacity = "1";
          img.style.transition = "opacity 0.3s ease-in";
        });
      }
    });
  });
  const initTracking = () => {
    const trackingForm = document.getElementById("tracking-form");
    const trackingInput = document.getElementById("tracking-input");
    const resultTrackingNumber = document.getElementById(
      "result-tracking-number"
    );
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const navLinks = document.querySelector(".nav-links");
    const trackingResult = document.getElementById("tracking-result");
    const errorMessage = document.getElementById("error-message");
    const showCourierModal = (couriers) => {
      const modalHtml = `
    <div id="courier-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 opacity-0 transition-opacity duration-300">
    <div class="bg-white rounded-xl w-full max-w-md mx-4 opacity-0 transform translate-y-4 transition-all duration-300">
    <div class="p-6">
    <div class="flex justify-between items-center mb-6">
    <h3 class="text-xl font-bold">Select Courier</h3>
    <button id="close-courier-modal" class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700">
    <i class="ri-close-line ri-lg"></i>
    </button>
    </div>
    <div class="space-y-2 max-h-[300px] overflow-y-auto">
    ${couriers
      .map(
        (courier) => `
    <button class="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between group"
    onclick="selectCourier('${courier.courier_code}', '${courier.courier_name}')">
    <span class="font-medium">${courier.courier_name}</span>
    <i class="ri-arrow-right-line opacity-0 group-hover:opacity-100 transition-opacity"></i>
    </button>
    `
      )
      .join("")}
    </div>
    </div>
    </div>
    </div>
    `;
      document.body.insertAdjacentHTML("beforeend", modalHtml);
      const modal = document.getElementById("courier-modal");
      const modalContent = modal.querySelector("div > div");
      setTimeout(() => {
        modal.style.opacity = "1";
        modalContent.style.opacity = "1";
        modalContent.style.transform = "translateY(0)";
      }, 10);
      document
        .getElementById("close-courier-modal")
        .addEventListener("click", () => {
          modal.style.opacity = "0";
          modalContent.style.opacity = "0";
          modalContent.style.transform = "translateY(1rem)";
          setTimeout(() => modal.remove(), 300);
        });
    };
    const showTrackingResult = (trackingNumber) => {
      const loadingSpinner = document.querySelector(".loading-spinner");
      loadingSpinner.classList.remove("show");
      document.querySelector(".tracking-button-text").textContent =
        "Track Package";
      cachedFetch(
        `https://packagetracker.ai/backend/api/trackPackage/detect`,
        {
            params: {
                number: trackingNumber
            }
        }
      )
        .then((data) => {
          if (data.code === 200 && data.data.length > 0) {
            showCourierModal(data.data);
          } else {
            showError("No courier found for this tracking number");
          }
        })
        .catch((error) => {
          showError("Failed to detect courier. Please try again.");
        });
    };
    window.selectCourier = (courierCode, courierName) => {
      const trackingNumber = document
        .getElementById("tracking-input")
        .value.trim();
      document.getElementById("courier-modal").remove();
      const loadingSpinner = document.querySelector(".loading-spinner");
      loadingSpinner.classList.add("show");
      document.querySelector(".tracking-button-text").textContent =
        "Tracking...";
      
        cachedFetch(
        `https://packagetracker.ai/backend/api/trackPackage/track`,
        {
            params: {
                number: trackingNumber,
                courier: courierCode
            }
        }
      )
        .then((data) => {
          if (data.meta && data.meta.code === 200 && data.data) {
            const trackingData = data.data[0];
            resultTrackingNumber.textContent = trackingData.tracking_number;
            document.getElementById("result-carrier").textContent = courierName;
            document.getElementById("result-status").textContent =
              trackingData.delivery_status || "In Transit";
            const lastUpdate = trackingData.update_at
              ? new Date(trackingData.update_at)
              : new Date();
            document.getElementById("result-last-update").textContent =
              lastUpdate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
            const trackinfo = trackingData.origin_info?.trackinfo || [];
            const shipmentProgress =
              document.getElementById("shipment-progress");
            shipmentProgress.innerHTML = "";
            trackinfo.forEach((info, index) => {
              const isLast = index === trackinfo.length - 1;
              const date = new Date(info.checkpoint_date);
              const formattedDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              });
              shipmentProgress.innerHTML += `
    <div class="flex">
    <div class="mr-4 flex flex-col items-center">
    <div class="w-4 h-4 bg-green-500 rounded-full"></div>
    ${!isLast ? '<div class="w-0.5 h-full bg-gray-200 mt-1"></div>' : ""}
    </div>
    <div>
    <p class="font-medium">${
      info.checkpoint_delivery_status || "In Transit"
    }</p>
    <p class="text-sm text-gray-500">${formattedDate}</p>
    <p class="text-sm text-gray-600">${
      info.tracking_detail || "Package in transit"
    }</p>
    <p class="text-sm text-gray-500">${
      info.city ? `${info.city}, ${info.country_iso2}` : "Location updating"
    }</p>
    </div>
    </div>`;
            });
            trackingResult.style.display = "flex";
            trackingResult.classList.remove("hidden");
            setTimeout(() => {
              trackingResult.classList.add("show");
            }, 10);
          } else {
            showError(
              "Failed to fetch tracking details. Please check the tracking number and try again."
            );
          }
        })
        .catch((error) => {
          showError(
            "Failed to fetch tracking details. Please check the tracking number and try again."
          );
        })
        .finally(() => {
          loadingSpinner.classList.remove("show");
          document.querySelector(".tracking-button-text").textContent =
            "Track Package";
        });
    };
    const showError = (message) => {
      const loadingSpinner = document.querySelector(".loading-spinner");
      loadingSpinner.classList.remove("show");
      document.querySelector(".tracking-button-text").textContent =
        "Track Package";
      const errorElement = document.getElementById("error-message");
      const errorText = document.getElementById("error-text");
      errorText.textContent = message;
      errorElement.classList.remove("hidden");
      errorElement.classList.add("shake");
      setTimeout(() => {
        errorElement.classList.remove("shake");
      }, 500);
    };
    const resetForm = () => {
      trackingResult.classList.remove("show");
      trackingResult.style.display = "none";
      setTimeout(() => {
        trackingResult.classList.add("hidden");
        trackingInput.value = "";
        document.getElementById("error-message").classList.add("hidden");
      }, 300);
    };
    if (hamburgerMenu) {
      hamburgerMenu.addEventListener("click", () => {
        navLinks.classList.toggle("show");
        hamburgerMenu.innerHTML = navLinks.classList.contains("show")
          ? '<i class="ri-close-line ri-lg"></i>'
          : '<i class="ri-menu-line ri-lg"></i>';
      });
    }
    if (trackingForm) {
      trackingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const trackingNumber = trackingInput.value.trim();
        if (trackingNumber.length < 6) {
          showError("Tracking number must be at least 6 characters long.");
          return;
        }

        const loadingSpinner = document.querySelector(".loading-spinner");
        const trackingResult = document.getElementById("tracking-result");
        const errorMessage = document.getElementById("error-message");

        const resetState = () => {
          trackingResult.classList.remove("show");
          trackingResult.style.display = "none";
          errorMessage.classList.add("hidden");
          loadingSpinner.classList.remove("show");
          document.querySelector(".tracking-button-text").textContent =
            "Track Package";
        };

        resetState();
        loadingSpinner.classList.add("show");
        document.querySelector(".tracking-button-text").textContent =
          "Tracking...";

        const trackingPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            if (trackingNumber === "ERROR123") {
              reject(
                new Error(
                  "We couldn't find any tracking information for the number you entered. Please check the number and try again."
                )
              );
            } else {
              resolve(trackingNumber);
            }
          }, 800);
        });

        trackingPromise
          .then(showTrackingResult)
          .catch((error) => showError(error.message));
      });
    }
    const elements = {
      "close-tracking": () => {
        trackingResult.classList.remove("show");
        setTimeout(() => trackingResult.classList.add("hidden"), 500);
      },
      "close-result": () => {
        trackingResult.classList.remove("show");
        setTimeout(() => trackingResult.classList.add("hidden"), 500);
      },
      "track-new": () => {
        trackingResult.classList.remove("show");
        setTimeout(() => {
          trackingResult.classList.add("hidden");
          trackingInput.value = "";
          trackingInput.focus();
        }, 500);
      },
      "close-error": () => {
        errorMessage.classList.remove("show");
        setTimeout(() => errorMessage.classList.add("hidden"), 500);
      },
      "close-error-btn": () => {
        errorMessage.classList.remove("show");
        setTimeout(() => errorMessage.classList.add("hidden"), 500);
      },
      "retry-tracking": () => {
        errorMessage.classList.remove("show");
        setTimeout(() => {
          errorMessage.classList.add("hidden");
          trackingInput.focus();
        }, 500);
      },
    };
    Object.entries(elements).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("click", handler);
      }
    });
    const resetElements = ["track-new", "close-tracking"];
    resetElements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("click", resetForm);
      }
    });
  };
  initTracking();
});
