import { initLander } from "../../core/lander";
import { eventNames } from "../../constants";
let tbinit = {
    [eventNames.ic] :  { notify: 'event', name: 'CTA-Click', id: 1795853 },
    [eventNames.tyimp]:{notify: 'event', name: 'AIBrowser_Generic_Install', id: 1795853}
}
initLander("PDF",tbinit,"PDF");

document.addEventListener("DOMContentLoaded", function () {
    let controller = new AbortController();
    let signal = controller.signal;
    const cancelButton = document.getElementById("cancel-button");
      cancelButton.addEventListener("click", (e) => {
          retryClickHandler(e);
          controller.abort();
          controller = new AbortController();
          signal = controller.signal;
      });
    const formatDropdown = document.getElementById("format-dropdown");
  const formatOptions = document.getElementById("format-options");
  const selectedFormat = document.getElementById("selected-format");
  const convertNowBtn = document.getElementById("convert-now");
  formatDropdown.addEventListener("click", function () {
    formatOptions.classList.toggle("hidden");
  });
  document.querySelectorAll(".format-option").forEach((option) => {
    option.addEventListener("click", function () {
      const format = this.getAttribute("data-format");
      selectedFormat.textContent = format;
      formatOptions.classList.add("hidden");
      selectedToFormat = format;
      document.getElementById("convert-now").classList.remove("hidden");
    });
  });
  document.addEventListener("click", function (e) {
    if (!formatDropdown.contains(e.target)) {
      formatOptions.classList.add("hidden");
    }
  });
  // Navigation scroll functionality
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu.classList.contains("open")) {
          mobileMenu.classList.remove("open");
        }
        const navbarHeight = document.querySelector(".navbar").offsetHeight;
        const targetPosition = targetElement.offsetTop - navbarHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
  // FAQ functionality
  const faqToggles = document.querySelectorAll(".faq-toggle");
  faqToggles.forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const content = this.nextElementSibling;
      const icon = this.querySelector("i");
      const allContents = document.querySelectorAll(".faq-content");
      const allIcons = document.querySelectorAll(".faq-toggle i");
      // Close all other FAQs
      allContents.forEach((item) => {
        if (item !== content) {
          item.classList.add("hidden");
        }
      });
      allIcons.forEach((item) => {
        if (item !== icon) {
          item.classList.remove("ri-subtract-line");
          item.classList.add("ri-add-line");
        }
      });
      // Toggle current FAQ
      content.classList.toggle("hidden");
      if (content.classList.contains("hidden")) {
        icon.classList.remove("ri-subtract-line");
        icon.classList.add("ri-add-line");
      } else {
        icon.classList.remove("ri-add-line");
        icon.classList.add("ri-subtract-line");
      }
    });
  });
  // Navbar scroll effect
  window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 10) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
  // Mobile menu toggle
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const closeMenuButton = document.getElementById("close-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  mobileMenuButton.addEventListener("click", function () {
    mobileMenu.classList.add("open");
  });
  closeMenuButton.addEventListener("click", function () {
    mobileMenu.classList.remove("open");
  });
  // Close mobile menu when clicking outside
  document.addEventListener("click", function (e) {
    if (
      mobileMenu.classList.contains("open") &&
      !mobileMenu.contains(e.target) &&
      !mobileMenuButton.contains(e.target)
    ) {
      mobileMenu.classList.remove("open");
    }
  });
  // File upload handling
  const fileInput = document.getElementById("file-input");
  const fileDropArea = document.querySelector(".file-drop-area");
  const uploadState = document.getElementById("upload-state");
  const loadingState = document.getElementById("loading-state");
  const resultState = document.getElementById("result-state");
  const errorState = document.getElementById("error-state");
  const resultFilename = document.getElementById("result-filename");
  const errorMessage = document.getElementById("error-message");
  const downloadButton = document.getElementById("download-button");
  const retryButton = document.getElementById("retry-button");
  const closeErrorButton = document.getElementById("close-error-button");
  // Auto focus the file input
  fileInput.focus();
  // Drag and drop functionality
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    fileDropArea.addEventListener(eventName, preventDefaults, false);
  });
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  ["dragenter", "dragover"].forEach((eventName) => {
    fileDropArea.addEventListener(eventName, highlight, false);
  });
  ["dragleave", "drop"].forEach((eventName) => {
    fileDropArea.addEventListener(eventName, unhighlight, false);
  });
  function highlight() {
    fileDropArea.classList.add("drag-over");
  }
  function unhighlight() {
    fileDropArea.classList.remove("drag-over");
  }
  fileDropArea.addEventListener("drop", handleDrop, false);
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      const file = files[0];
      const supportedFormats = [
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",
        ".jpg",
        ".jpeg",
        ".png",
        ".html",
        ".txt",
        ".svg",
      ];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      if (supportedFormats.includes(fileExtension)) {
        handleFile(file);
      } else {
        showError(
          "Unsupported file format. Please upload PDF, Word, Excel, PowerPoint, JPG, PNG, HTML, or Text files only."
        );
      }
    }
  }
  document
    .getElementById("remove-file")
    .addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      resetToDefaultState();
      fileDropArea.classList.remove("drag-over");
    });
  fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const supportedFormats = [
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx",
        ".jpg",
        ".jpeg",
        ".png",
        ".html",
        ".txt",
        ".svg",
      ];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      if (supportedFormats.includes(fileExtension)) {
        handleFile(file);
      } else {
        showError(
          "Unsupported file format. Please upload PDF, Word, Excel, PowerPoint, JPG, PNG, HTML, or Text files only."
        );
      }
    }
  });
  let selectedToFormat = "";
  /* function handleFormatSelection(format) {
    selectedToFormat = format;
    if (fileInput.files.length > 0) {
      convertNowBtn.classList.remove("hidden");
    }
  } */
  // Close any open dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    const dropdowns = document.querySelectorAll(".dropdown-content");
    dropdowns.forEach((dropdown) => {
      if (
        !dropdown.contains(e.target) &&
        !e.target.matches(".dropdown-trigger")
      ) {
        dropdown.classList.add("hidden");
      }
    });
  });
  function handleFile(file) {
    const maxSize = 200 * 1024 * 1024; // 200MB in bytes
    if (file.size > maxSize) {
      showError("File is too large. Maximum size is 200MB.");
      return;
    }
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const fileInfo = document.getElementById("file-info");
    const formatSelector = document.getElementById("format-selector");
    const removeFileBtn = document.getElementById("remove-file");
    if (fileInfo && formatSelector && removeFileBtn) {
      fileInfo.textContent = file.name;
      const currentFormat = getFormatFromExtension(fileExtension);
      if (!currentFormat) {
        showError("Unsupported file format");
        return;
      }
      // Show the detected format
      fileInfo.textContent = `${file.name} (${currentFormat} file)`;
      formatSelector.classList.remove("hidden");
      removeFileBtn.classList.remove("hidden");
      updateFormatOptions(currentFormat);
      
      // Update the file input value to show the filename in tooltip
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
    }
  }
  function updateFormatOptions(currentFormat) {
    const formatOptions = document.querySelectorAll(".format-option");
    const allowedFormats = {
      PDF: ["DOCX", "XLSX", "PPTX", "JPG", "PNG", "HTML", "TXT"],
      DOCX: ["PDF", "JPG", "PNG", "HTML", "TXT"],
      XLSX: ["PDF", "JPG", "PNG"],
      PPTX: ["PDF", "JPG", "PNG"],
      JPG: ["PDF", "PNG", "TXT"],
      PNG: ["PDF", "JPG"],
      HTML: ["PDF", "PNG", "JPG", "HTML", "DOCX", "XLSX", "TXT"],
      TXT: ["PDF", "JPG"],
    };
    formatOptions.forEach((option) => {
      const format = option.getAttribute("data-format");
      const allowed = allowedFormats[currentFormat]?.includes(format);
      if (!allowed || format === currentFormat) {
        option.classList.add("opacity-50", "cursor-not-allowed");
        option.disabled = true;
      } else {
        option.classList.remove("opacity-50", "cursor-not-allowed");
        option.disabled = false;
      }
    });
    // Reset selected format
    const selectedFormat = document.getElementById("selected-format");
    selectedFormat.textContent = "Select Format";
    selectedToFormat = "";
    document.getElementById("convert-now").classList.add("hidden");
  }
  function getFormatFromExtension(ext) {
    const formatMap = {
      pdf: "PDF",
      doc: "DOCX",
      docx: "DOCX",
      xls: "XLSX",
      xlsx: "XLSX",
      ppt: "PPTX",
      pptx: "PPTX",
      jpg: "JPG",
      jpeg: "JPG",
      png: "PNG",
      html: "HTML",
      txt: "TXT",
      svg: "SVG",
    };
    return formatMap[ext];
  }
  function startConversion() {
    const fileInput = document.getElementById("file-input");
    if (fileInput) {
      const file = fileInput.files[0];
      if (!file || !selectedToFormat) {
        showError("Please select a file and output format");
        return;
      }
      showLoading();
    }
  }
  function showLoading() {
    uploadState.classList.add("hidden");
    resultState.classList.add("hidden");
    errorState.classList.add("hidden");
    loadingState.classList.remove("hidden");
  }
  function showResult(filename) {
    // Get the new extension based on selected output format
    let newExtension;
    switch (selectedToFormat.toLowerCase()) {
      case "pdf":
        newExtension = "pdf";
        break;
      case "word":
        newExtension = "docx";
        break;
      case "excel":
        newExtension = "xlsx";
        break;
      case "powerpoint":
        newExtension = "pptx";
        break;
      case "jpg":
        newExtension = "jpg";
        break;
      case "png":
        newExtension = "png";
        break;
      case "html":
        newExtension = "html";
        break;
    //   case "txt":
    //     newExtension = "txt";
        break;
      default:
        newExtension = "pdf";
    }
    const newFilename =
      filename.substring(0, filename.lastIndexOf(".")) + "." + newExtension;
    resultFilename.textContent = newFilename;
    uploadState.classList.add("hidden");
    loadingState.classList.add("hidden");
    errorState.classList.add("hidden");
    resultState.classList.remove("hidden");
  }
  
  function showMultipleFilesResult(files) {
    // Update result filename to show ZIP file
    const originalFilename = fileInput.files[0].name;
    const baseName = originalFilename.substring(0, originalFilename.lastIndexOf("."));
    const zipFilename = `${baseName}_converted.zip`;
    resultFilename.textContent = zipFilename;
    
    // Show result state
    uploadState.classList.add("hidden");
    loadingState.classList.add("hidden");
    errorState.classList.add("hidden");
    resultState.classList.remove("hidden");
  }
  
  async function downloadMultipleFiles() {
    try {
      const zip = new JSZip();
      const files = window.convertedFiles;
      const originalFilename = fileInput.files[0].name;
      
      // Add each file to the ZIP
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.FileData) {
          // Convert base64 to binary
          const byteCharacters = atob(file.FileData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let j = 0; j < byteCharacters.length; j++) {
            byteNumbers[j] = byteCharacters.charCodeAt(j);
          }
          const byteArray = new Uint8Array(byteNumbers);
          
          // Add file to ZIP
          zip.file(file.FileName, byteArray);
        }
      }
      
      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // Create download link
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      
      // Set ZIP filename
      const baseName = originalFilename.substring(0, originalFilename.lastIndexOf("."));
      link.download = `${baseName}_converted.zip`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log(`ZIP created with ${files.length} files`);
    } catch (error) {
      console.error("ZIP creation error:", error);
      showError("Failed to create ZIP file. Please try again.");
    }
  }
  function showError(message) {
    errorMessage.textContent = message;
    uploadState.classList.add("hidden");
    loadingState.classList.add("hidden");
    resultState.classList.add("hidden");
    errorState.classList.remove("hidden");
  }
  function resetToUpload() {
    fileInput.value = "";
    uploadState.classList.remove("hidden");
    loadingState.classList.add("hidden");
    resultState.classList.add("hidden");
    errorState.classList.add("hidden");
    fileInput.focus();
  }
    // Button event handlers
  convertNowBtn.addEventListener("click", async function () {
    const file = fileInput.files[0];
    const selectedFormat = selectedToFormat;
    if (!file || !selectedFormat) {
      showError("Please select both a file and output format");
      return;
    }
    const currentFormat = file.name.split(".").pop().toLowerCase();
    if (currentFormat === selectedFormat.toLowerCase()) {
      showError("Cannot convert to same format");
      return;
    }
    showLoading();
    //smooth scrool to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    try {
 
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(
        `https://convertpdfs.ai/backend/api/convert/start?from=${currentFormat}&to=${selectedFormat.toLowerCase()}`,
        {
            signal: signal,
          method: "POST",
          body: formData,
     
        }
      );
      if (!response.ok) {
        throw new Error("Conversion failed");
      }
      
      const data = await response.json();
      if (data.Files && data.Files.length > 0) {
        // Store all converted files
        window.convertedFiles = data.Files;
        
        if (data.Files.length === 1) {
          // Single file - show direct download
          const convertedFile = data.Files[0];
          window.convertedFileData = convertedFile;
          showResult(convertedFile.FileName);
        } else {
          // Multiple files - show ZIP download
          showMultipleFilesResult(data.Files);
        }
      } else {
        showError("Conversion failed. Please try again.");
      }
    }
     catch (error) {
      if (error.name === 'AbortError') {
        uploadState.classList.add("hidden");
    loadingState.classList.add("hidden");
    resultState.classList.add("hidden");
      } else {
          showError("Failed to convert file. Please try again.");
      }
    }
  });
  downloadButton.addEventListener("click", async function () {
    // Check if we have multiple files (ZIP download) or single file
    if (window.convertedFiles && window.convertedFiles.length > 1) {
      // Multiple files - create and download ZIP
      await downloadMultipleFiles();
    } else {
      // Single file - direct download
      const fileData = window.convertedFileData;
      if (fileData && fileData.FileData) {
        try {
          const byteCharacters = atob(fileData.FileData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: `application/${fileData.FileExt}`,
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileData.FileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Download error:", error);
          showError("Download failed. Please try again.");
        }
      } else {
        showError("Download failed. Please try converting again.");
      }
    }
  });
  document
    .getElementById("try-another-button")
    .addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      resetToDefaultState();
    });
  function retryClickHandler(e){
    e.preventDefault();
    e.stopPropagation();
    const fileInfo = document.getElementById("file-info");
    const removeFileBtn = document.getElementById("remove-file");
    const fileDropArea = document.querySelector(".file-drop-area");
    const formatSelector = document.getElementById("format-selector");
    formatSelector.classList.add("hidden");
    errorState.classList.add("fade-out");
    setTimeout(() => {
      errorState.classList.add("hidden");
      errorState.classList.remove("fade-out");
      errorState.style.transform = "";
      uploadState.classList.remove("hidden");
      uploadState.style.opacity = "0";
      uploadState.style.transform = "translateY(10px)";
      requestAnimationFrame(() => {
        uploadState.style.transition = "all 0.3s ease-out";
        uploadState.style.opacity = "1";
        uploadState.style.transform = "translateY(0)";
      });
      fileInput.value = "";
      fileInfo.textContent = "Max file size: 200MB";
      convertNowBtn.classList.add("hidden");
      removeFileBtn.classList.add("hidden");
      fileDropArea.classList.remove("drag-over");
      window.convertedFileData = null;
      window.convertedFiles = null;
      selectedToFormat = "";
      setTimeout(() => {
        fileInput.focus();
        uploadState.style.transition = "";
        uploadState.style.transform = "";
      }, 300);
    }, 300);
  }
  retryButton.addEventListener("click", retryClickHandler);
  function resetToDefaultState() {
    // Reset file input and format selections
    fileInput.value = "";
    // Reset file info text
    const fileInfo = document.getElementById("file-info");
    fileInfo.textContent = "Max file size: 200 MB";
    // Hide convert now button, format selector, and remove file button
    const formatSelector = document.getElementById("format-selector");
    const removeFileBtn = document.getElementById("remove-file");
    const selectedFormat = document.getElementById("selected-format");
    convertNowBtn.classList.add("hidden");
    formatSelector.classList.add("hidden");
    removeFileBtn.classList.add("hidden");
    selectedFormat.textContent = "Select Format";
    // Add fade-out effect to error state
    if (!errorState.classList.contains("hidden")) {
      errorState.style.opacity = "0";
      setTimeout(() => {
        errorState.classList.add("hidden");
        errorState.style.opacity = "1";
        uploadState.classList.remove("hidden");
      }, 300);
    } else {
      // Reset all states directly if error state is already hidden
      uploadState.classList.remove("hidden");
      loadingState.classList.add("hidden");
      resultState.classList.add("hidden");
      errorState.classList.add("hidden");
    }
    // Remove drag-over state if present
    fileDropArea.classList.remove("drag-over");
    // Reset focus
    fileInput.focus();
    // Clear any stored file data
    window.convertedFileData = null;
    window.convertedFiles = null;
    // Reset any error messages
    if (errorMessage) {
      errorMessage.textContent = "";
    }
    // Reset the file input value to ensure it's cleared
    fileInput.value = "";
  }
  // Add remove file button event listener
  document
    .getElementById("remove-file")
    .addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      resetToDefaultState();
    });
});
